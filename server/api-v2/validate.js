const yup = require('yup');

const frame = yup.object({ 
  width: yup.number().required().positive().strict(),
  height: yup.number().required().positive().strict(),
}).strict().required();

const shadow = yup.object({
  color: yup.string().strict().required(),
  blur: yup.number().strict().default(0),
  offsetX: yup.number().strict().default(0),
  offsetY: yup.number().strict().default(0),
  affectStroke: yup.bool().strict().default(false),
  nonScaling: yup.bool().strict().default(false)
}).strict();

const layer = yup.object({
  shadow,
  name: yup.string(),
  angle: yup.number().strict().default(0),
  //stroke: null,
  strokeWidth: yup.number().strict().default(0),
  left: yup.number().strict().default(0),
  top: yup.number().strict().default(0),
  width:  yup.number().required().positive().strict(),
  height:  yup.number().required().positive().strict(),
  opacity: yup.number().default(1).strict(),
  originX: yup.string().default('top').strict(),
  originY: yup.string().default('left').strict(),
  scaleX: yup.number().default(1).strict(),
  scaleY: yup.number().default(1).strict(),
  type: yup.string().strict().required(),
  flipX: yup.bool().default(false).strict(),
  flipY: yup.bool().default(false).strict(),
  skewX: yup.number().default(0).strict(),
  skewY: yup.number().default(0).strict(),
  visible: yup.bool().default(true).strict(),
  fill: yup.string().strict().required().strict(),
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