// Markup Editor IDE - editor.js
let htmlEditor, cssEditor, jsEditor;
let previewWindow = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize CodeMirror Editors
    htmlEditor = CodeMirror.fromTextArea(document.getElementById('html-editor'), {
        mode: 'htmlmixed',
        theme: 'monokai',
        lineNumbers: true,
        lineWrapping: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 2,
        tabSize: 2,
        indentWithTabs: false,
        extraKeys: { 'Ctrl-Space': 'autocomplete' }
    });

    cssEditor = CodeMirror.fromTextArea(document.getElementById('css-editor'), {
        mode: 'css',
        theme: 'monokai',
        lineNumbers: true,
        lineWrapping: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 2,
        tabSize: 2
    });

    jsEditor = CodeMirror.fromTextArea(document.getElementById('js-editor'), {
        mode: 'javascript',
        theme: 'monokai',
        lineNumbers: true,
        lineWrapping: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 2,
        tabSize: 2
    });

    // 初期サンプルコンテンツ
    htmlEditor.setValue(`<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Sample Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>これはマークアップエディターのサンプルです。</p>
    <button onclick="greet()">クリックしてね</button>
</body>
</html>`);

    cssEditor.setValue(`body {
    font-family: Arial, sans-serif;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    text-align: center;
    padding: 60px;
    margin: 0;
}

h1 {
    font-size: 3em;
    margin-bottom: 20px;
}

button {
    padding: 15px 35px;
    font-size: 1.2em;
    background: #ff6b6b;
    color: white;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: 0.3s;
}

button:hover {
    transform: scale(1.1);
    background: #ff5252;
}`);

    jsEditor.setValue(`// Sample JavaScript
function greet() {
    alert('こんにちは！エディターが正常に動作しています 🎉');
}

console.log('Markup Editor IDE が起動しました！');`);

    // ボタンイベント
    document.getElementById('view-btn').addEventListener('click', openPreview);
    document.getElementById('reset-btn').addEventListener('click', resetEditors);
    document.getElementById('download-btn').addEventListener('click', downloadProject);

    // 自動保存
    const saveToLocal = () => {
        localStorage.setItem('htmlContent', htmlEditor.getValue());
        localStorage.setItem('cssContent', cssEditor.getValue());
        localStorage.setItem('jsContent', jsEditor.getValue());
    };

    htmlEditor.on('change', saveToLocal);
    cssEditor.on('change', saveToLocal);
    jsEditor.on('change', saveToLocal);

    // 前回の内容を復元
    if (localStorage.getItem('htmlContent')) {
        htmlEditor.setValue(localStorage.getItem('htmlContent'));
        cssEditor.setValue(localStorage.getItem('cssContent'));
        jsEditor.setValue(localStorage.getItem('jsContent'));
    }

    console.log('%cMarkup Editor IDE initialized successfully!', 'color: #00ffcc; font-size: 14px;');
});

// 新しいタブでプレビュー表示
function openPreview() {
    const html = htmlEditor.getValue();
    const css = cssEditor.getValue();
    const js = jsEditor.getValue();

    if (previewWindow && !previewWindow.closed) {
        previewWindow.close();
    }

    previewWindow = window.open('about:blank', '_blank');
    
    if (previewWindow) {
        const fullHTML = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Preview</title>
    <style>${css}</style>
</head>
<body>
    ${html}
    <script>${js}<\/script>
</body>
</html>`;

        previewWindow.document.write(fullHTML);
        previewWindow.document.close();
        
        document.getElementById('status').textContent = '✅ 新しいタブでプレビューを開きました';
        setTimeout(() => {
            document.getElementById('status').textContent = 'Ready';
        }, 2500);
    } else {
        alert('ポップアップがブロックされました。ブラウザの設定でポップアップを許可してください。');
    }
}

// リセット
function resetEditors() {
    if (confirm('すべての内容をリセットしますか？')) {
        htmlEditor.setValue(`<!DOCTYPE html>\n<html lang="ja">\n<head>\n    <meta charset="UTF-8">\n    <title>Sample</title>\n</head>\n<body>\n    <h1>Hello</h1>\n</body>\n</html>`);
        cssEditor.setValue(`body { background: #111; color: white; text-align: center; padding: 50px; }`);
        jsEditor.setValue(`console.log('Reset complete!');`);
        
        localStorage.removeItem('htmlContent');
        localStorage.removeItem('cssContent');
        localStorage.removeItem('jsContent');
        
        document.getElementById('status').textContent = 'リセットしました';
        setTimeout(() => document.getElementById('status').textContent = 'Ready', 2000);
    }
}

// プロジェクトダウンロード
function downloadProject() {
    const html = htmlEditor.getValue();
    const css = cssEditor.getValue();
    const js = jsEditor.getValue();
    
    const combinedHTML = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Exported Project</title>
    <style>${css}</style>
</head>
<body>
    ${html}
    <script>${js}<\/script>
</body>
</html>`;
    
    const blob = new Blob([combinedHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-project.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    document.getElementById('status').textContent = '📥 プロジェクトをダウンロードしました！';
    setTimeout(() => document.getElementById('status').textContent = 'Ready', 2500);
}
