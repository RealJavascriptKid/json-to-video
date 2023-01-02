const yup = require('yup');

const frame = yup.object({ 
  width: yup.number().required().positive().strict(),
  height: yup.number().required().positive().strict(),
}).strict().required();

const shadow = yup.object({
  color: yup.string().strict().required(),
  blur: yup.number().default(0),
  offsetX: yup.number().default(0),
  offsetY: yup.number().default(0),
  affectStroke: yup.bool().default(false),
  nonScaling: yup.bool().default(false)
});

const layer = yup.object({
  shadow,
  name: yup.string(),
  angle: yup.number().default(0),
  //stroke: null,
  strokeWidth: yup.number().default(0),
  left: yup.number().default(0),
  top: yup.number().default(0),
  width:  yup.number().required().positive().strict(),
  height:  yup.number().required().positive().strict(),
  opacity: yup.number().default(1),
  originX: yup.string().default('top'),
  originY: yup.string().default('left'),
  scaleX: yup.number().default(1),
  scaleY: yup.number().default(1),
  type: yup.string().strict().required(),
  flipX: yup.bool().default(false),
  flipY: yup.bool().default(false),
  skewX: yup.number().default(0),
  skewY: yup.number().default(0),
  visible: yup.bool().default(true),
  fill: yup.string().strict().required(),
})

const scene = yup
.object({
  duration:yup.number().required().positive().integer().strict(),
  layers:yup.array().of(layer).strict().required('Please sepcify scenes'),
})
.strict()


const scenes = yup.array().of(scene).required('Please sepcify scenes');

const validate = async (params) => {
  
    const reqSchema = yup.object({
      id:yup.string().strict().required(),
      frame,
      scenes,
    });
  
    reqSchema.validateSync(params);
}

module.exports = validate;