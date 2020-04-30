const inquirer = require('inquirer');
const EventEmitter = require('events').EventEmitter;
const colors = require('colorette');
const questions = require('./../util/inquirer-options').questions;

const COMPLETED_EVENT = 'COMPLETED_EVENT';
const CONTINUE_EVENT = 'CONTINUE_EVENT';

class InteractiveMake {
  constructor(name, generator, config) {
    this.em = new EventEmitter();
    this.columnSchema = [];
    this.tableName = name;
    this.generator = generator;
    this.config = config;

    console.log(
      colors.green(`Creating columns for ${this.tableName} table...`)
    );
    this.interactive();
  }

  interactive() {
    this.runQuestions();
    this.em.on(CONTINUE_EVENT, this.continue$.bind(this));
    this.em.on(COMPLETED_EVENT, this.completed$.bind(this));
  }

  runQuestions() {
    const $this = this;
    inquirer.prompt(questions).then(function (answers) {
      const { running, ...rest } = answers;
      $this.columnSchema.push(rest);

      if (running) {
        $this.em.emit(CONTINUE_EVENT);
      } else {
        $this.em.emit(COMPLETED_EVENT);
      }
    });
  }

  continue$() {
    this.runQuestions();
  }

  completed$() {
    this.em.removeListener(CONTINUE_EVENT, this.continue$);
    this.em.removeListener(COMPLETED_EVENT, this.completed$);

    if (this.columnSchema.length) {
      const columnsStr = this._generateColumns(
        this.tableName,
        this.columnSchema
      );
      this._generator(this.tableName, columnsStr);
    }
  }

  async _generator(tableName, columns) {
    const config = {
      ...this.config,
      variables: {
        tableName,
        columns,
      },
    };
    const generatedFileName = await this.generator.make(tableName, config);
    console.log(colors.green(generatedFileName));
  }

  _generateColumns(columnSchema) {
    const columns = this._generateColumnsArray(columnSchema);
    return columns.join(';\n\t\t') + ';';
  }

  _generateColumnsArray(columnSchema) {
    return columnSchema.map((schema) => {
      let base = `t.${schema.type}("${schema.column}")`;
      if (schema.unsigned) {
        base += '.unsigned()';
      }
      if (schema.unique) {
        base += '.unique()';
      }
      if (schema.nullable) {
        base += '.nullable()';
      } else {
        base += '.notNullable()';
      }
      if (schema.references) {
        const refTable = schema.references.split('.')[0];
        const refColumn = schema.references.split('.')[1];
        base += `.unsigned()\n\t\t\t\t.references("${refColumn}")\n\t\t\t\t.inTable("${refTable}")
                `;
      }
      return base;
    });
  }
}

module.exports = InteractiveMake;
