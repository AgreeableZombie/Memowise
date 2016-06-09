import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import Promise from 'bluebird';

const UserSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    trim: true,
    unique: true,
    match: [/.+@.+\..+/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    default: '',
    validate: [
      password => password && password.length > 6,
      'Please make your password longer',
    ],
  },
  facebook: {
    id: String,
    token: String,
  },
  scoreTotal: Number,

}, { timestamps: true });

UserSchema.pre('save', function hashPassword(next) {
  const cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, 5).bind(this)
    .then(hash => {
      this.password = hash;
      this.scoreTotal = 0;
      console.log('user created with initial score 0');
      next();
    });
});
/**
 * Create instance method for authenticating user
 */
UserSchema.methods.authenticate = function authenticate(password, callback) {
  const hash = this.password;
  bcrypt.compare(password, hash, (err, isMatch) => {
    if (err) {
      return callback(err);
    }
    return callback(null, isMatch);
  });
};

export default mongoose.model('User', UserSchema);
