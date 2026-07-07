// html-variables-mode.js - HTML Variables専用モード（超熟考版）
CodeMirror.defineMode("html-variables", function(config, parserConfig) {
    const htmlMixedMode = CodeMirror.getMode(config, "htmlmixed");
    
    return CodeMirror.overlayMode(htmlMixedMode, {
        token: function(stream, state) {
            // 呼び出しタグ: <_Name_ arg1 arg2>
            if (stream.match(/<_[\w-]+_/i)) {
                return "variable-2"; // 明るい青緑
            }
            // 終了タグ: </_>
            if (stream.match(/<\/_>/)) {
                return "variable-2";
            }
            
            // 定義タグ: <__Name__>
            if (stream.match(/<__[\w-]+__/i)) {
                return "def"; // 定義色
            }
            if (stream.match(/<\/__[\w-]+__>/i)) {
                return "def";
            }
            
            // 引数部分の文字列を強調
            if (stream.match(/"([^"]*)"/) || stream.match(/'([^']*)'/)) {
                return "string";
            }
            
            return null;
        }
    });
});

// MIMEタイプ登録
CodeMirror.defineMIME("text/html", "html-variables");
CodeMirror.defineMIME("text/x-html-variables", "html-variables");
