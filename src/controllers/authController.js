import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { JWT_SECRET } from '../config/env.js';
import { sendVerificationEmail, sendWelcomeEmail } from '../config/resend.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

const generateVerificationCode = () => {
  // Genera un código de 6 dígitos
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (req, res) => {
  try {
    const { email, password, nombre, telefono } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('correo_electronico', email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    // Hash password and store in auth.users (Supabase Auth)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        nombre: nombre,
        telefono: telefono
      }
    });

    if (authError) {
      throw authError;
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const tokenExpiration = new Date();
    tokenExpiration.setMinutes(tokenExpiration.getMinutes() + 15); // 15 minutes expiration

    // Create user in our custom usuarios table
    const { data: user, error } = await supabaseAdmin
      .from('usuarios')
      .insert([{
        id: authUser.user.id, // Use the same ID from auth.users
        correo_electronico: email,
        nombre: nombre,
        telefono: telefono || null,
        token_verificacion_email: verificationCode,
        fecha_expiracion_token: tokenExpiration.toISOString(),
        ip_ultimo_acceso: clientIP,
        verificado: false,
        autenticacion_social: false
      }])
      .select('id, correo_electronico, nombre, telefono, verificado, fecha_creacion')
      .single();

    if (error) {
      // If our table insert fails, clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      throw error;
    }

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode, nombre);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail the registration if email fails, just log it
    }

    // Generate JWT token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification code.',
      user: {
        id: user.id,
        email: user.correo_electronico,
        nombre: user.nombre,
        telefono: user.telefono,
        verified: user.verificado,
        createdAt: user.fecha_creacion
      },
      token,
      verificationRequired: true
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;

    // Find user by email
    const { data: user, error } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('correo_electronico', email)
      .single();

    if (error || !user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if account is locked
    if (user.cuenta_bloqueada) {
      const bloqueoExpira = new Date(user.fecha_bloqueo);
      bloqueoExpira.setHours(bloqueoExpira.getHours() + 24); // Bloqueo por 24 horas
      
      if (new Date() < bloqueoExpira) {
        return res.status(423).json({
          error: 'Account locked',
          message: user.razon_bloqueo || 'Account is temporarily locked due to multiple failed login attempts. Try again later.',
          unlockTime: bloqueoExpira
        });
      } else {
        // Reset lock if time has expired
        await supabaseAdmin
          .from('usuarios')
          .update({
            cuenta_bloqueada: false,
            intentos_login_fallidos: 0,
            fecha_bloqueo: null,
            razon_bloqueo: null
          })
          .eq('id', user.id);
      }
    }

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      // Increment failed login attempts
      const nuevosIntentos = user.intentos_login_fallidos + 1;
      const shouldLock = nuevosIntentos >= 5;

      await supabaseAdmin
        .from('usuarios')
        .update({
          intentos_login_fallidos: nuevosIntentos,
          cuenta_bloqueada: shouldLock,
          fecha_bloqueo: shouldLock ? new Date().toISOString() : null,
          razon_bloqueo: shouldLock ? 'Multiple failed login attempts' : null
        })
        .eq('id', user.id);

      if (shouldLock) {
        return res.status(423).json({
          error: 'Account locked',
          message: 'Account has been locked due to multiple failed login attempts'
        });
      }

      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect',
        attemptsRemaining: 5 - nuevosIntentos
      });
    }

    // Update last login info and reset failed attempts
    await supabaseAdmin
      .from('usuarios')
      .update({
        ip_ultimo_acceso: clientIP,
        fecha_ultimo_login: new Date().toISOString(),
        intentos_login_fallidos: 0,
        cuenta_bloqueada: false,
        fecha_bloqueo: null,
        razon_bloqueo: null
      })
      .eq('id', user.id);

    // Generate JWT token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.correo_electronico,
        nombre: user.nombre,
        telefono: user.telefono,
        verified: user.verificado,
        createdAt: user.fecha_creacion
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      user: {
        id: user.id,
        email: user.correo_electronico,
        nombre: user.nombre,
        telefono: user.telefono,
        verified: user.verificado,
        createdAt: user.fecha_creacion,
        lastLogin: user.fecha_ultimo_login,
        avatarUrl: user.url_avatar
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile',
      message: error.message
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Verification code is required'
      });
    }

    // Find user by verification code
    const { data: user, error } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('token_verificacion_email', code)
      .single();

    if (error || !user) {
      return res.status(400).json({
        error: 'Invalid code',
        message: 'Verification code is invalid or expired'
      });
    }

    // Check if code is expired (15 minutes)
    const tokenExpiration = new Date(user.fecha_expiracion_token);
    if (new Date() > tokenExpiration) {
      return res.status(400).json({
        error: 'Code expired',
        message: 'Verification code has expired. Please request a new one.'
      });
    }

    // Check if already verified
    if (user.verificado) {
      return res.status(200).json({
        message: 'Email already verified',
        verified: true
      });
    }

    // Update user as verified
    const { error: updateError } = await supabaseAdmin
      .from('usuarios')
      .update({
        verificado: true,
        token_verificacion_email: null,
        fecha_expiracion_token: null,
        fecha_verificacion: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    // Send welcome email
    try {
      await sendWelcomeEmail(user.correo_electronico, user.nombre);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the verification if welcome email fails
    }

    res.json({
      message: 'Email verified successfully',
      verified: true
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: error.message
    });
  }
};

const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Email is required'
      });
    }

    // Find user by email
    const { data: user, error } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('correo_electronico', email)
      .single();

    if (error || !user) {
      // Don't reveal if user exists for security
      return res.json({
        message: 'If the email exists, a verification code has been sent'
      });
    }

    // Check if already verified
    if (user.verificado) {
      return res.status(400).json({
        error: 'Already verified',
        message: 'Email is already verified'
      });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const tokenExpiration = new Date();
    tokenExpiration.setMinutes(tokenExpiration.getMinutes() + 15);

    // Update user with new code
    const { error: updateError } = await supabaseAdmin
      .from('usuarios')
      .update({
        token_verificacion_email: verificationCode,
        fecha_expiracion_token: tokenExpiration.toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      throw updateError;
    }

    // Send verification email
    try {
      await sendVerificationEmail(user.correo_electronico, verificationCode, user.nombre);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      return res.status(500).json({
        error: 'Failed to send email',
        message: 'Could not send verification email. Please try again.'
      });
    }

    res.json({
      message: 'Verification code sent successfully',
      // In development, you might want to return the code for testing
      ...(process.env.NODE_ENV === 'development' && { verificationCode })
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      error: 'Failed to resend verification',
      message: error.message
    });
  }
};

const checkVerificationStatus = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Email is required'
      });
    }

    // Find user by email
    const { data: user, error } = await supabaseAdmin
      .from('usuarios')
      .select('correo_electronico, verificado, fecha_creacion')
      .eq('correo_electronico', email)
      .single();

    if (error || !user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No user found with this email'
      });
    }

    res.json({
      email: user.correo_electronico,
      verified: user.verificado,
      createdAt: user.fecha_creacion
    });
  } catch (error) {
    console.error('Check verification status error:', error);
    res.status(500).json({
      error: 'Failed to check verification status',
      message: error.message
    });
  }
};

export {
  register,
  login,
  getProfile,
  verifyEmail,
  resendVerification,
  checkVerificationStatus
};
