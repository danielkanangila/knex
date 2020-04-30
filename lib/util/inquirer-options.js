const colors = require('colorette');
const dataType = [
  'increments',
  'integer',
  'bigInteger',
  'text',
  'string',
  'float',
  'decimal',
  'boolean',
  'date',
  'datetime',
  'time',
  'timestamp',
];

const required = (input) => {
  const done = this.async();
  if (!input) {
    done('Column name is required');
    return;
  }
  done(null, true);
};

exports.questions = [
  {
    type: 'input',
    name: 'column',
    message: 'Column name:',
    validate: required,
  },
  { type: 'list', name: 'type', message: 'Type:', choices: dataType },
  { type: 'confirm', name: 'nullable', message: 'Nullable?', default: false },
  { type: 'confirm', name: 'unique', message: 'Unique?', default: false },
  { type: 'input', name: 'references', message: 'References:' },
  {
    type: 'confirm',
    name: 'running',
    message: colors.green('Continue?'),
    default: true,
  },
];
