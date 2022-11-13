const yup = require('yup');

const animationsSchema = yup
  .array()
  .of(
    yup
      .object({
        style: yup
          .string()
          .strict()
          .typeError('Invalid Animation: style should be a string')
          .min(1, 'Invalid Animation: style should have at least 1 character')
          .required('Invalid Animation: style is required'),
        durations: yup
          .array(
            yup.number().strict().typeError('Invalid Animation: durations should contain numbers'),
          )
          .strict()
          .min(2, 'Invalid Animation: durations should have at least 2 numbers')
          .required('Invalid Animation: durations array is required'),
        values: yup
          .array()
          .of(yup.number().strict().typeError('Invalid Animation: values should contain numbers'))
          .min(2, 'Invalid Animation: values should have at least 2 numbers')
          .required('Invalid Animation: values array is required'),
        unit: yup
          .string()
          .strict()
          .typeError('Invalid Animation: unit should be a string')
          .min(1, 'Invalid Animation: unit should have at least 1 character'),
      })
      .strict(),
  )
  .strict();

const textElementSchema = yup.object({
  text: yup
    .string()
    .strict()
    .typeError('Invalid TextElement: text should be string')
    .required('Invalid TextElement: text is required'),
  style: yup.object().typeError('Invalid TextElement: style should be a valid JavaScript Object'),
  start: yup.number().strict().typeError('Invalid TextElement: start should be a number'),
  duration: yup.number().strict().typeError('Invalid TextElement: duration should be a number'),
  animations: animationsSchema,
});

const imageElementSchema = yup.object({
  src: yup
    .string()
    .strict()
    .typeError('Invalid ImageElement: src should be string')
    .required('Invalid ImageElement: src is required'),
  style: yup.object().typeError('Invalid ImageElement: style should be a valid JavaScript Object'),
  start: yup.number().strict().typeError('Invalid ImageElement: start should be a number'),
  duration: yup.number().strict().typeError('Invalid ImageElement: duration should be a number'),
  animations: animationsSchema,
});

const audioElementSchema = yup.object({
  src: yup
    .string()
    .strict()
    .typeError('Invalid AudioElement: src should be string')
    .required('Invalid ImageElement: src is required'),
  volume: yup
    .number()
    .strict()
    .typeError('Invalid AudioElement: volume should be a number')
    .min(0, 'Invalid AudioElement: volume should be greater than or equal to 0')
    .max(1, 'Invalid AudioElement: volume should be less than or equal to 1'),
  muted: yup.bool('Invalid AudioElement: muted should be "true" or "false"'),
  rate: yup
    .number()
    .strict()
    .typeError('Invalid AudioElement: rate should be a number')
    .min(0.0625, 'Invalid AudioElement: rate should be greater than or equal to 0.0625')
    .max(16, 'Invalid AudioElement: rate should be less than or equal to 16'),
  loop: yup.bool('Invalid AudioElement: loop should be "true" or "false"'),
  startFrom: yup
    .number()
    .strict()
    .typeError('Invalid AudioElement: startFrom should be a number')
    .min(0, 'Invalid AudioElement: startFrom should be greater than or equal to 0'),
  endAt: yup
    .number()
    .strict()
    .typeError('Invalid AudioElement: endAt should be a number')
    .moreThan(yup.ref('startFrom'), 'Invalid AudioElement: endAt should be greater than startFrom'),
  style: yup.object().typeError('Invalid AudioElement: style should be a valid JavaScript Object'),
  start: yup.number().strict().typeError('Invalid AudioElement: start should be a number'),
  duration: yup.number().strict().typeError('Invalid AudioElement: duration should be a number'),
});

const videoElementSchema = yup.object({
  src: yup
    .string()
    .strict()
    .typeError('Invalid VideoElement: src should be string')
    .required('Invalid ImageElement: src is required'),
  volume: yup
    .number()
    .strict()
    .typeError('Invalid VideoElement: volume should be a number')
    .min(0, 'Invalid VideoElement: volume should be greater than or equal to 0')
    .max(1, 'Invalid VideoElement: volume should be less than or equal to 1'),
  muted: yup.bool('Invalid VideoElement: muted should be "true" or "false"'),
  rate: yup
    .number()
    .strict()
    .typeError('Invalid VideoElement: rate should be a number')
    .min(0.0625, 'Invalid VideoElement: rate should be greater than or equal to 0.0625')
    .max(16, 'Invalid VideoElement: rate should be less than or equal to 16'),
  loop: yup.bool('Invalid VideoElement: loop should be "true" or "false"'),
  startFrom: yup
    .number()
    .strict()
    .typeError('Invalid VideoElement: startFrom should be a number')
    .min(0, 'Invalid VideoElement: startFrom should be greater than or equal to 0'),
  endAt: yup
    .number()
    .strict()
    .typeError('Invalid VideoElement: endAt should be a number')
    .moreThan(yup.ref('startFrom'), 'Invalid VideoElement: endAt should be greater than startFrom'),
  style: yup.object().typeError('Invalid VideoElement: style should be a valid JavaScript Object'),
  start: yup.number().strict().typeError('Invalid VideoElement: start should be a number'),
  duration: yup.number().strict().typeError('Invalid VideoElement: duration should be a number'),
});

const elementSchema = yup
  .object()
  .shape({
    type: yup
      .string()
      .required('Invalid Element: type is required')
      .oneOf(
        ['text', 'image', 'video', 'audio'],
        'Invalid Element: type should be one of "text", "image", "audio", or "video"',
      )
      .strict()
      .typeError('Invalid Element: type should be a string'),
    style: yup
      .object()
      .typeError(`Invalid ${yup.ref('type')}Element: style should be a valid JavaScript Object`),
    start: yup
      .number()
      .strict()
      .typeError(`Invalid ${yup.ref('type')}Element: start should be a number`),
    duration: yup
      .number()
      .strict()
      .typeError(`Invalid ${yup.ref('type')}Element: duration should be a number`),
    animations: animationsSchema,
    text: yup
      .string()
      .strict()
      .typeError(`Invalid ${yup.ref('type')}Element: text should be string`)
      .when('type', (type) => {
        if (type === 'text')
          return yup.string().strict().required('Invalid textElement: text is required');
      }),
    src: yup
      .object()
      .shape({
        localFile: yup
          .string()
          .strict()
          .typeError(`Invalid ${yup.ref('type')}Element: localFile should be a string`)
          .when('src.url', (url) => {
            if (!url || url === '')
              return yup
                .string()
                .strict()
                .required(`Invalid ${yup.ref('type')}Element: localFile is required`);
          }),
        url: yup
          .string()
          .strict()
          .typeError(`Invalid ${yup.ref('type')}Element: url should be a string`)
          .when('src.localFile', (localFile) => {
            if (!localFile || localFile === '')
              return yup
                .string()
                .strict()
                .required(`Invalid ${yup.ref('type')}Element: url is required`);
          }),
      })
      .strict()
      .when('type', (type) => {
        if (type === 'image' || type === 'audio' || type === 'video') {
          return yup
            .object()
            .strict()
            .typeError(`Invalid ${type}Element: src should be a valid JavaScript Object`)
            .required(`Invalid ${type}Element: src is required`);
        }
      }),
    volume: yup
      .number()
      .strict()
      .typeError(`Invalid ${yup.ref('type')}Element: volume should be a number`)
      .min(0, `Invalid ${yup.ref('type')}Element: volume should be greater than or equal to `)
      .max(1, `Invalid ${yup.ref('type')}Element: volume should be less than or equal to 1`),
    muted: yup.bool(`Invalid ${yup.ref('type')}Element: muted should be "true" or "false"`),
    rate: yup
      .number()
      .strict()
      .typeError(`Invalid ${yup.ref('type')}Element: rate should be a number`)
      .min(
        0.0625,
        `Invalid ${yup.ref('type')}Element: rate should be greater than or equal to 0.062`,
      )
      .max(16, `Invalid ${yup.ref('type')}Element: rate should be less than or equal to 16`),
    loop: yup.bool(`Invalid ${yup.ref('type')}Element: loop should be "true" or "false"`),
    startFrom: yup
      .number()
      .strict()
      .typeError(`Invalid ${yup.ref('type')}Element: startFrom should be a numbe`)
      .min(0, `Invalid ${yup.ref('type')}Element: startFrom should be greater than or equal to 0`),
    endAt: yup
      .number()
      .strict()
      .typeError(`Invalid ${yup.ref('type')}Element: endAt should be a numbe`)
      .moreThan(
        yup.ref('startFrom'),
        `Invalid ${yup.ref('type')}Element: endAt should be greater than startFrom`,
      ),
  })
  .strict()
  .typeError('Invalid Element: element should be a valid JavaScript Object');

const scenesSchema = yup
  .array()
  .of(
    yup
      .object({
        duration: yup
          .number()
          .strict()
          .typeError('Invalid Scene: duration should be a number')
          .required('Invalid Scene: duration is required'),
        style: yup.object().typeError('Invalid Scene: style should be a valid JavaScript Object'),
        offset: yup.number().strict().typeError('Invalid Scene: offset should be a number'),
        elements: yup
          .array()
          .of(elementSchema)
          .strict()
          .typeError('Invalid Scene: elements should be an array'),
      })
      .strict(),
  )
  .strict();

const videoSchema = yup.object().shape({
  duration: yup
    .number()
    .strict()
    .typeError('Invalid Video: duration should be a number')
    .required('Invalid Video: duration is required'),
  style: yup.object().typeError('Invalid Video: style should be a valid JavaScript Object'),
  fps: yup
    .number()
    .strict()
    .typeError('Invalid Video: fps should be a number')
    .integer('Invalid Video: fps should be an integer')
    .moreThan(0, 'Invalid Video: fps should be greater than 0')
    .required('Invalid Video: fps is required'),
  width: yup
    .number()
    .strict()
    .typeError('Invalid Video: width should be a number')
    .required('Invalid Video: width is required'),
  height: yup
    .number()
    .strict()
    .typeError('Invalid Video: height should be a number')
    .required('Invalid Video: height is required'),
  scenes: scenesSchema,
});

module.exports = videoSchema;
