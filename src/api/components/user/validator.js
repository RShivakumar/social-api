import Joi from 'joi';

export const signupValidator = async (data) => {
  const Schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
    username: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    dob: Joi.string().required(),
    countryCode: Joi.string().required(),
    mobileNumber: Joi.number().required(),
    country: Joi.string().required(),
    gender: Joi.string().required(),
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

export const loginValidator = async (data) => {
  const Schema = Joi.object({
    email: Joi.string().optional(),
    password: Joi.string().required(),
    rememberMe: Joi.boolean().optional(),
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

export const updateProfileValidator = async (data) => {
  const Schema = Joi.object({
    username: Joi.string().optional(),
    email: Joi.string().optional(),
    password: Joi.string().optional(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    dob: Joi.string().optional(),
    countryCode: Joi.string().optional(),
    mobileNumber: Joi.number().optional(),
    country: Joi.string().optional(),
    gender: Joi.string().optional(),
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
