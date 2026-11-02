(() => {
    const root = document.documentElement;
    try {
        const savedTheme = localStorage.getItem('people-theme');
        if (savedTheme === 'light' || savedTheme === 'dark') root.dataset.theme = savedTheme;
    } catch { /* The server-provided theme works when storage is unavailable. */ }

    document.addEventListener('DOMContentLoaded', () => {
        const toggle = document.getElementById('theme-toggle');
        const label = document.getElementById('theme-label');
        const updateThemeLabel = () => {
            const next = root.dataset.theme === 'dark' ? 'Light mode' : 'Dark mode';
            label.textContent = next;
            toggle.setAttribute('aria-label', `Switch to ${next.toLowerCase()}`);
        };
        updateThemeLabel();
        toggle.addEventListener('click', event => {
            event.preventDefault();
            root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
            try { localStorage.setItem('people-theme', root.dataset.theme); } catch { /* Theme still works for this page. */ }
            updateThemeLabel();
        });

        document.querySelectorAll('.notice-close').forEach(button => {
            button.addEventListener('click', () => {
                const notice = button.closest('.notice');
                const nextTarget = notice.nextElementSibling?.querySelector('a, button, input') || document.getElementById('main');
                notice.remove();
                nextTarget.focus();
            });
        });

        const search = document.getElementById('people-search');
        if (!search) return;
        const rows = [...document.querySelectorAll('[data-person-row]')];
        if (!rows.length) return;
        document.getElementById('directory-search').hidden = false;
        const entries = rows.map(row => ({ row, text: `${row.querySelector('[data-person-name]').textContent} ${row.querySelector('[data-person-email]').textContent}`.toLocaleLowerCase() }));
        const filterPeople = () => {
            const query = search.value.trim().toLocaleLowerCase();
            let count = 0;
            entries.forEach(({ row, text }) => { row.hidden = !text.includes(query); if (!row.hidden) count++; });
            document.getElementById('no-search-results').hidden = count !== 0;
            document.getElementById('directory-results').textContent = query ? `${count} of ${rows.length} people shown` : `${rows.length} ${rows.length === 1 ? 'person' : 'people'} in your directory`;
        };
        search.addEventListener('input', filterPeople);
        document.getElementById('clear-search').addEventListener('click', () => { search.value = ''; filterPeople(); search.focus(); });
    });
})();
