import { prismjsPlugin } from 'vite-plugin-prismjs';

export function setupPrismjs() {
  return prismjsPlugin({
    languages: ['javascript'],
    plugins: ['line-numbers', 'copy-to-clipboard', 'match-braces', 'previewers'], // 官网有其他功能,这里开启行数和复制按钮功能
    theme: 'default',
    css: true
  });
}
