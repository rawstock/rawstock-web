import uuidv4 = require('uuid/v4');
import crypto = require('crypto');

import { UUID, UUID_EXPIRED } from '@server/service/constants';

// 生成MD5
function md5(content) {
  return crypto
    .createHash('md5')
    .update(content)
    .digest('hex');
}

module.exports = async (ctx, next) => {
  // uuid规范
  let uuid = ctx.cookies.get(UUID);

  if (!uuid) {
    // uuid规则
    uuid = md5(uuidv4()).substr(0, 20);
    const domain = ctx.request.hostname;

    ctx.cookies.set(UUID, uuid, {
      expires: UUID_EXPIRED,
      httpOnly: true,
      domain,
    });
  }
  ctx.state.uuid = uuid;

  await next();
};