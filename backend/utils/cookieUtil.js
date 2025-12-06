const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,                   // true only in production (HTTPS)
    sameSite: isProduction ? 'none' : 'lax',// none for cross-site prod, lax for localhost
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
};

export default getCookieOptions;

// deployment code
// {
//   httpOnly: true,
//   secure: true,         // HTTPS required in production
//   sameSite: 'none',     // required for cross-site cookies
//   maxAge: 7 * 24 * 60 * 60 * 1000,
//   path: '/',
// // };

// const getCookieOptions = () => {
//   const isProduction = process.env.NODE_ENV === 'production';

//   return {
//     httpOnly: true,
//     secure: isProduction,                   // true only in production
//     sameSite: isProduction ? 'none' : 'lax',// none for cross-site prod, lax for localhost
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//     path: '/',
//   };
// };

// export default getCookieOptions;