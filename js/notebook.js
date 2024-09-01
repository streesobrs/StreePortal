document.addEventListener('DOMContentLoaded', function () {
    loadNotes();
});

function saveNote() {
    var note = document.getElementById('note').value;
    var title = document.getElementById('noteTitle').value || '未命名笔记';
    var timestamp = new Date().toLocaleString();
    var noteId = 'note-' + Date.now();

    var noteData = {
        title: title,
        content: note,
        timestamp: timestamp
    };

    console.log('Saving note:', noteData); // 添加调试信息

    try {
        localStorage.setItem(noteId, JSON.stringify(noteData));
        alert('笔记已保存！');
        loadNotes();
        clearNote();
    } catch (e) {
        console.error('Error saving note:', e); // 捕获并显示错误
        alert('保存笔记时出错，请检查控制台获取更多信息。');
    }
}

function loadNotes() {
    var noteList = document.getElementById('noteList');
    if (noteList) {
        noteList.innerHTML = '';
    } else {
        console.error('noteList element not found');
    }

    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.startsWith('note-')) {
            var noteData = JSON.parse(localStorage.getItem(key));
            var li = document.createElement('li');
            li.textContent = noteData.title + ' (' + noteData.timestamp + ')';

            var deleteBtn = document.createElement('span');
            deleteBtn.textContent = '删除';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = function () {
                deleteNote(key);
            };

            li.appendChild(deleteBtn);
            li.setAttribute('data-key', key);
            li.onclick = function () {
                loadNote(this.getAttribute('data-key'));
            };
            noteList.appendChild(li);
        }
    }
}

function loadNote(key) {
    var noteData = JSON.parse(localStorage.getItem(key));
    if (noteData) {
        document.getElementById('note').value = noteData.content;
        document.getElementById('noteTitle').value = noteData.title;
    } else {
        console.error('Note data is null or undefined');
    }
}

function clearNote() {
    document.getElementById('note').value = '';
    document.getElementById('noteTitle').value = '';
}

function deleteNote(key) {
    localStorage.removeItem(key);
    loadNotes();
}
