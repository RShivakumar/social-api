import Joi from 'joi';

export const createPostValidator = async (data) => {
  const mediaSchema = Joi.object({ url: Joi.string().required() });
  const Schema = Joi.object({
    caption: Joi.string().optional(),
    media: Joi.array().items(mediaSchema),
  });

  const validate = Schema.validate(data);
  let error = false;
  let message = '';

  if (validate.error) {
    message = validate.error.details[0].message;
    message = message.replace(/"/g, '');
    error = true;
  }
  return { error, message };
};
