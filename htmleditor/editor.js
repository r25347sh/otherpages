// Markup Editor IDE - editor.js（改行インデント + ハイライト修正版）
let htmlEditor, cssEditor, jsEditor;
let previewWindow = null;

document.addEventListener('DOMContentLoaded', () => {
    // HTML Editor（ハイライト強化）
    htmlEditor = CodeMirror.fromTextArea(document.getElementById('html-editor'), {
        mode: 'htmlmixed',
        theme: 'monokai',
        lineNumbers: true,
        lineWrapping: true,
        autoCloseTags: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,           // インデント幅を4に
        tabSize: 4,
        indentWithTabs: false,
        extraKeys: { 
            'Ctrl-Space': 'autocomplete',
            'Tab': 'indentMore',
            'Shift-Tab': 'indentLess'
        }
    });

    // CSS Editor
    cssEditor = CodeMirror.fromTextArea(document.getElementById('css-editor'), {
        mode: 'css',
        theme: 'monokai',
        lineNumbers: true,
        lineWrapping: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false
    });

    // JS Editor
    jsEditor = CodeMirror.fromTextArea(document.getElementById('js-editor'), {
        mode: 'javascript',
        theme: 'monokai',
        lineNumbers: true,
        lineWrapping: true,
        indentUnit: 4,
        tabSize: 4,
        indentWithTabs: false
    });

    // 初期サンプル
    htmlEditor.setValue(`<!-- HTML Variables 定義例 -->
<__Card__ color title desc>
    <div class="card [color] p-6 rounded-xl shadow-lg">
        <h2 class="text-2xl font-bold">[title]</h2>
        <p class="mt-3">[desc]</p>
    </div>
</__Card__>

<!-- 使用例 -->
<_Card_ "bg-gradient-to-r from-blue-500 to-purple-600 text-white" "最強エディター" "HTML Variables機能が使えます！"></_>
<_Card_ "bg-gray-800 text-emerald-400" "タイトル2" "2つ目のカードです"></_>`);

    cssEditor.setValue(`body {
    font-family: system-ui, sans-serif;
    background: #0f0f1a;
    color: #e0e0ff;
    padding: 40px;
}

.card {
    transition: transform 0.3s;
}
.card:hover {
    transform: translateY(-8px);
}`);

    jsEditor.setValue(`console.log("Markup Editor with HTML Variables loaded!");`);

    // ボタンイベント
    document.getElementById('view-btn').addEventListener('click', openPreview);
    document.getElementById('upload-project-btn').addEventListener('click', uploadProject);
    document.getElementById('reset-btn').addEventListener('click', resetEditors);
    document.getElementById('download-btn').addEventListener('click', downloadProjectWithVariables);

    document.getElementById('upload-html-btn').addEventListener('click', () => handleFileUpload(htmlEditor, 'html'));
    document.getElementById('upload-css-btn').addEventListener('click', () => handleFileUpload(cssEditor, 'css'));
    document.getElementById('upload-js-btn').addEventListener('click', () => handleFileUpload(jsEditor, 'js'));

    // Auto-save
    const saveToLocal = () => {
        localStorage.setItem('htmlContent', htmlEditor.getValue());
        localStorage.setItem('cssContent', cssEditor.getValue());
        localStorage.setItem('jsContent', jsEditor.getValue());
    };

    htmlEditor.on('change', saveToLocal);
    cssEditor.on('change', saveToLocal);
    jsEditor.on('change', saveToLocal);

    if (localStorage.getItem('htmlContent')) {
        htmlEditor.setValue(localStorage.getItem('htmlContent'));
        cssEditor.setValue(localStorage.getItem('cssContent'));
        jsEditor.setValue(localStorage.getItem('jsContent'));
    }
});

// ====================== 残りの関数（Variables, Upload, Previewなど）は変更なし ======================
function extractVariablesDefinitions(html) {
    const definitions = {};
    const regex = /<__(\w+)__(.*?)>([\s\S]*?)<\/__\1__>/g;
    let match;
    while ((match = regex.exec(html)) !== null) {
        const name = match[1];
        const params = match[2].trim().split(/\s+/).filter(Boolean);
        const content = match[3];
        definitions[name] = { params, content };
    }
    return definitions;
}

function expandVariables(html, definitions) {
    return html.replace(/<_(\w+)_([^>]*?)><\/_>/g, (match, name, argsStr) => {
        if (!definitions[name]) {
            return `<div style="color:#ff5555; padding:15px; border:1px solid #ff5555;">[Variables Error: ${name} is not defined]</div>`;
        }

        const args = [];
        const argRegex = /"([^"]*)"|'([^']*)'|(\S+)/g;
        let m;
        while ((m = argRegex.exec(argsStr)) !== null) {
            const val = m[1] || m[2] || m[3];
            if (val) args.push(val);
        }

        let content = definitions[name].content;
        const params = definitions[name].params;

        params.forEach((param, index) => {
            const value = args[index] !== undefined ? args[index] : '';
            content = content.replace(new RegExp(`\\[${param}\\]`, 'g'), value);
        });

        return `<var-html data-vh-id="${name}">${content}</var-html>`;
    });
}

function handleFileUpload(editor, type) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'html' ? '.html,.htm' : type === 'css' ? '.css' : '.js';
    
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = ev => {
            const newContent = ev.target.result;
            const current = editor.getValue().trim();

            if (current === '') {
                editor.setValue(newContent);
            } else if (confirm(`現在の${type.toUpperCase()}の内容を上書きしますか？\n\nキャンセルで「末尾に追加」します。`)) {
                editor.setValue(newContent);
            } else {
                editor.setValue(current + '\n\n' + newContent);
            }
            document.getElementById('status').textContent = `${type.toUpperCase()} を読み込みました`;
            setTimeout(() => document.getElementById('status').textContent = 'Ready', 2000);
        };
        reader.readAsText(file);
    };
    input.click();
}

function uploadProject() {
    alert('📂 Project全体アップロード機能は現在開発中です。\n\n個別のアップロードボタンを使ってください。');
}

function openPreview() {
    let html = htmlEditor.getValue();
    const css = cssEditor.getValue();
    const js = jsEditor.getValue();

    const definitions = extractVariablesDefinitions(html);
    html = expandVariables(html, definitions);
    html = html.replace(/<__[\s\S]*?<\/__\w+__>/g, '');

    const fullHTML = `<!DOCTYPE html>
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

    if (previewWindow) previewWindow.close();
    previewWindow = window.open('about:blank', '_blank');
    previewWindow.document.write(fullHTML);
    previewWindow.document.close();
}

function downloadProjectWithVariables() {
    let html = htmlEditor.getValue();
    const css = cssEditor.getValue();
    const js = jsEditor.getValue();

    const definitions = extractVariablesDefinitions(html);
    let expandedHtml = expandVariables(html, definitions);

    expandedHtml = expandedHtml.replace(/<__(\w+)__[\s\S]*?<\/__\1__>/g, (match) => {
        return `<!-- ==================== HTML Variable Definition (Removed on export) ==================== -->\n<!-- ${match.replace(/</g, '&lt;').replace(/>/g, '&gt;')} -->\n`;
    });

    const fullHTML = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Exported Project</title>
    <style>${css}</style>
</head>
<body>
    ${expandedHtml}
    <script>${js}<\/script>
</body>
</html>`;

    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-project.html';
    a.click();
    URL.revokeObjectURL(url);

    document.getElementById('status').textContent = '✅ Variables展開済みでダウンロード完了！';
    setTimeout(() => document.getElementById('status').textContent = 'Ready', 2500);
}

function resetEditors() {
    if (confirm('すべてリセットしますか？')) {
        location.reload();
    }
}
