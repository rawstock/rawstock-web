export = async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    ctx.body = 'Error Happens';
    ctx.logger.error(e);
  }
};
