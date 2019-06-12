if (process.env.NODE_ENV === 'test') {
    module.exports = {
      JWT_SECRET: 'ZVbqg4+fnq&+(>UD*()XUf58@PdDC9eo5rMtx/bS&s>U3xAgp80*Hp*w_D<p'
    };
  } else {
    module.exports = {
      JWT_SECRET: 'ZVbqg4+fnq&+(>UD*()XUf58@PdDC9eo5rMtx/bS&s>U3xAgp80*Hp*w_D<p'
    };
  }