// ASCII字符集：entityName 2 char
// https://www.cnblogs.com/polk6/p/html-entity.html
var asciiChartSet_en2c = {
  '&nbsp;': ' ',
  '&excl;': '!',
  '&quot;': '"',
  '&num;': '#',
  '&dollar;': '$',
  '&percnt;': '%',
  '&amp;': '&',
  '&apos;': "'",
  '&lpar;': '(',
  '&rpar;': ')',
  '&ast;': '*',
  '&plus;': '+',
  '&comma;': ',',
  '&hyphen;': '-',
  '&period;': '.',
  '&sol;': '/',
  '&colon;': ':',
  '&semi;': ';',
  '&lt;': '<',
  '&equals;': '=',
  '&gt;': '>',
  '&quest;': '?',
  '&commat;': '@',
  '&lsqb;': '[',
  '&bsol;': '\\',
  '&rsqb;': ']',
  '&circ;': '^',
  '&lowbar;': '_',
  '&grave;': '`',
  '&lcub;': '{',
  '&verbar;': '|',
  '&rcub;': '}',
  '&tilde;': '~',
};

export default function entityName2char(oldStr) {
  // e.g. Entity Name转换为字符
  //var oldStr = '&lpar;中文&rpar;';
  var newStr = oldStr.replace(/(&.+?;)/g, function (matched) {
    var rs = asciiChartSet_en2c[matched];
    return rs == undefined ? matched : rs;
  });
  //console.log(newStr); // => (中文)
  return newStr;
}
