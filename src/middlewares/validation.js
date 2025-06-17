import Joi from 'joi';

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message,
        details: error.details
      });
    }
    
    next();
  };
};

// User validation schemas
const userRegisterSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  nombre: Joi.string().min(2).required(),
  telefono: Joi.string().optional().allow('')
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Email verification schemas
const verificationCodeSchema = Joi.object({
  code: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
    'string.length': 'Verification code must be exactly 6 digits',
    'string.pattern.base': 'Verification code must contain only numbers'
  })
});

const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required()
});

// Product validation schemas
const productSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().required(),
  price: Joi.number().positive().required(),
  categoryId: Joi.number().integer().positive().required(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  stock: Joi.number().integer().min(0).optional().default(0)
});

// Address validation schemas
const addressSchema = Joi.object({
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zipCode: Joi.string().required(),
  country: Joi.string().required(),
  phone: Joi.string().optional()
});

// Review validation schemas
const reviewSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().optional()
});

// Cart validation schemas
const cartItemSchema = Joi.object({
  productId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).required()
});

export {
  validateRequest,
  userRegisterSchema,
  userLoginSchema,
  verificationCodeSchema,
  resendVerificationSchema,
  productSchema,
  addressSchema,
  reviewSchema,
  cartItemSchema
};
