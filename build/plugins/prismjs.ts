import { prismjsPlugin } from 'vite-plugin-prismjs';

export function setupPrismjs() {
  return prismjsPlugin({
    languages: 'all',
    plugins: ['line-numbers', 'copy-to-clipboard'], // 官网有其他功能,这里开启行数和复制按钮功能
    theme: 'tomorrow',
    css: true
  });
}
