const fs = require('fs');
const path = require('path');

// 读取并执行 JS 文件，返回导出的对象（兼容 export default）
function loadJSObject(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const script = `
    (function() {
      ${content.replace(/export default\s+(\w+);?/, 'return $1;')}
    })()
  `;
  return eval(script);
}

// 自定义序列化函数：将对象转为格式化的字符串，但特定数组保持一行
function stringifyWithCompactArrays(obj, indent = 0) {
  const spaces = '  '.repeat(indent);
  const nextSpaces = '  '.repeat(indent + 1);

  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    // 如果是数组，直接返回紧凑的一行（用 JSON.stringify 默认无空格）
    return JSON.stringify(obj);
  }

  // 处理对象
  const keys = Object.keys(obj);
  const parts = keys.map((key, index) => {
    const value = obj[key];
    // 如果是 act3_tag 或 darkcarnival，特别处理：数组保持一行
    if ((key === 'act3_tag' || key === 'darkcarnival') && Array.isArray(value)) {
      const compactValue = JSON.stringify(value);
      return `${nextSpaces}"${key}": ${compactValue}`;
    } else {
      // 其他属性递归处理
      const formattedValue = stringifyWithCompactArrays(value, indent + 1);
      return `${nextSpaces}"${key}": ${formattedValue}`;
    }
  });

  return `{\n${parts.join(',\n')}\n${spaces}}`;
}

// 加载数据
const darkcarnival = loadJSObject(path.join(__dirname, 'darkcarnival_token.js'));
const dota2_heros = loadJSObject(path.join(__dirname, 'dota2_heros.js'));

// 构建 英雄 → token 数组（按等级重复）
const heroTokens = {};

for (const [trait, levels] of Object.entries(darkcarnival)) {
  for (const [level, heroes] of Object.entries(levels)) {
    const count = parseInt(level, 10); // 3, 2, 或 1
    for (const hero of heroes) {
      if (!heroTokens[hero]) heroTokens[hero] = [];
      for (let i = 0; i < count; i++) {
        heroTokens[hero].push(trait);
      }
    }
  }
}

// 为 dota2_heros 中的每个英雄添加 darkcarnival 属性
for (const heroName of Object.keys(dota2_heros)) {
  dota2_heros[heroName].darkcarnival = heroTokens[heroName] || [];
}

// 使用自定义序列化生成新文件
const formattedContent = stringifyWithCompactArrays(dota2_heros, 0);
const output = `const dota2_heros = ${formattedContent};\n\nexport default dota2_heros;`;
fs.writeFileSync(path.join(__dirname, 'dota2_heros_with_traits.js'), output, 'utf8');
console.log('✅ 已生成文件，其中 act3_tag 和 darkcarnival 数组保持一行：dota2_heros_with_traits.js');