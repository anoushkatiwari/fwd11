// Theme Toggle, SAU Departments, Announcement Hub, Announcement Checklists, Priority Dates & Study Planner
const SAU_DEPARTMENTS = [
    {
        slug: 'computer-science-engineering',
        name: 'Department of Computer Science and Engineering',
        faculty: 'Faculty of Engineering & Technology (FET)',
        icon: '💻',
        programs: 'B.Tech CSE (AI & ML, Data Science & AI, Cybersecurity, Business Systems), Dual Degree B.Tech-M.Tech, M.Tech CS, MCA, MSc CS, MS Data Science & AI, PhD',
        facultyHighlights: 'FET Computing & Research Group',
        description: 'Focuses on algorithms, software engineering, artificial intelligence, machine learning, quantum computing, cybersecurity, and high-performance computing.'
    },
    {
        slug: 'life-sciences-biotechnology',
        name: 'Life Sciences & Biotechnology',
        faculty: 'Faculty of Life Sciences & Biotechnology',
        icon: '🔬',
        programs: 'MSc Biotechnology, PhD in Life Sciences & Biotechnology',
        facultyHighlights: 'Prof. Ritu Gaur, Dr. Ananda Mustafiz, Dr. Yuba Raj Pokharel, Dr. Ravi Shankar Akundi',
        description: 'Conducts laboratory research across cancer biology, molecular medicine, neurochemistry, plant science, and biochemical therapeutics.'
    },
    {
        slug: 'international-studies',
        name: 'International Relations & Public Policy',
        faculty: 'Faculty of International Studies (FIS)',
        icon: '🌍',
        programs: 'MA International Relations, PhD International Relations, Public Policy & Governance',
        facultyHighlights: 'FIS & Institute of South Asian Studies Faculty',
        description: 'Explores South Asian regional cooperation, global politics, diplomacy, and public policy through research and coursework.'
    },
    {
        slug: 'social-sciences',
        name: 'Sociology & Sustainable Development',
        faculty: 'Faculty of Social Sciences (FSS)',
        icon: '🧩',
        programs: 'MA Sociology, PhD Sociology, Communication for Sustainable Development',
        facultyHighlights: 'FSS Sociology & Development Faculty',
        description: 'Examines South Asian social structures, contemporary issues, research methodologies, and sustainable development communication.'
    },
    {
        slug: 'economics-management',
        name: 'Economics & Management Studies',
        faculty: 'Faculty of Economics & Faculty of Management',
        icon: '📊',
        programs: 'MA Economics, PhD Economics, MBA, Executive MBA, Integrated BBA-MBA',
        facultyHighlights: 'Economics & Management Faculty',
        description: 'Combines quantitative economic analysis and South Asian development studies with strategic management and leadership.'
    },
    {
        slug: 'legal-studies',
        name: 'Department of Legal Studies',
        faculty: 'Faculty of Legal Studies',
        icon: '⚖️',
        programs: 'LLM (Master of Laws), PhD in Legal Studies',
        facultyHighlights: 'Legal Studies Faculty & AI/Law Programme Team',
        description: 'Covers international law, comparative constitutional law, trade, environmental law, human rights, and emerging AI & law themes.'
    },
    {
        slug: 'sciences-mathematics-climate',
        name: 'Mathematics, Physical & Chemical Sciences, Climate Change',
        faculty: 'FMS, FPS, FCS & Interdisciplinary Centre on Climate Change',
        icon: '🌡️',
        programs: 'B.Tech Mathematics & Computing, MSc/PhD Mathematics, Physics PhD, Chemical Sciences, MS Climate Change & Sustainability',
        facultyHighlights: 'Mathematical, Physical, Chemical & Climate Faculty',
        description: 'Spans numerical analysis, graph theory, plasma physics, nanotechnology, chemical sciences, and South Asian climate sustainability.'
    },
    {
        slug: 'arts-design-virtual',
        name: 'Media, Arts, Design & Virtual Campus',
        faculty: 'Faculty of Arts and Design & SAU Virtual Campus',
        icon: '🎨',
        programs: 'PhD Media, Arts & Design, Communication Design & Graphics, Vocal Music, Fashion Design, Online BCA (Hons)',
        facultyHighlights: 'Arts, Design & Virtual Campus Educators',
        description: 'Connects visual communication, South Asian cultural arts, design practice, and flexible digital degree learning.'
    }
];

const ANNOUNCEMENTS_STORAGE_KEY = 'sauAnnouncementsV4';
const PLANNER_STORAGE_KEY = 'sauStudyTasks';
const PRIORITY_WINDOW_DAYS = 7;

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initDepartmentDirectory();
    initAnnouncementHub();
    initSingleDepartmentPage();
    initPlanner();
});

function safeParseArray(key, fallbackBuilder) {
    try {
        const raw = localStorage.getItem(key);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
    } catch (err) {
        // Fallback to fresh defaults if stored data was malformed
    }
    const defaults = fallbackBuilder();
    try {
        localStorage.setItem(key, JSON.stringify(defaults));
    } catch (err) {
        // Ignore storage quota errors
    }
    return defaults;
}

function safeSaveArray(key, arr) {
    try {
        localStorage.setItem(key, JSON.stringify(arr));
    } catch (err) {
        // Ignore storage quota errors
    }
}

function initThemeToggle() {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const savedTheme = localStorage.getItem('theme') || 'light';

    document.body.setAttribute('data-theme', savedTheme);
    if (themeToggleBtn) {
        themeToggleBtn.textContent = savedTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';

        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            themeToggleBtn.textContent = newTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
        });
    }
}

/* ---------------- Date & Priority Helpers ---------------- */

function getIsoOffsetDays(daysOffset) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + daysOffset);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getPriorityStatus(targetDateStr) {
    if (!targetDateStr) {
        return { isPriority: false, label: '' };
    }

    const parts = targetDateStr.split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) {
        return { isPriority: false, label: '' };
    }

    const target = new Date(parts[0], parts[1] - 1, parts[2]);
    target.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays <= PRIORITY_WINDOW_DAYS) {
        if (diffDays === 0) {
            return { isPriority: true, label: 'Priority • Today' };
        }
        if (diffDays === 1) {
            return { isPriority: true, label: 'Priority • Tomorrow' };
        }
        return { isPriority: true, label: `Priority • In ${diffDays} days` };
    }

    return { isPriority: false, label: '' };
}

function formatReadableDate(isoDateStr) {
    if (!isoDateStr) return 'General Update';
    const parts = isoDateStr.split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return isoDateStr;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function findDepartmentByNameOrSlug(value) {
    if (!value) return SAU_DEPARTMENTS[0];
    const normalized = String(value).trim().toLowerCase();
    return (
        SAU_DEPARTMENTS.find(
            d => d.slug.toLowerCase() === normalized || d.name.toLowerCase() === normalized
        ) || SAU_DEPARTMENTS[0]
    );
}

function noticeBelongsToDepartment(notice, deptObj) {
    if (!notice || !deptObj) return false;
    const resolved = findDepartmentByNameOrSlug(notice.deptSlug || notice.deptName);
    return resolved.slug === deptObj.slug;
}

/* ---------------- Dedicated Departments Page ---------------- */

function initDepartmentDirectory() {
    const deptGrid = document.getElementById('deptDirectoryGrid');
    const deptSearch = document.getElementById('deptSearch');
    const emptyMsg = document.getElementById('noDeptMsg');

    if (!deptGrid) return;

    const allNotices = getAnnouncements();
    const cards = Array.from(deptGrid.querySelectorAll('.card'));

    cards.forEach(card => {
        const slug = card.getAttribute('data-dept-slug');
        const deptObj = findDepartmentByNameOrSlug(slug);
        const noticeContainer = card.querySelector('.dept-live-notices');
        if (!noticeContainer) return;

        const deptNotices = allNotices.filter(n => noticeBelongsToDepartment(n, deptObj));
        noticeContainer.innerHTML = '';

        const heading = document.createElement('div');
        heading.className = 'dept-notices-heading';
        heading.textContent = `Department Announcements (${deptNotices.length})`;
        noticeContainer.appendChild(heading);

        if (deptNotices.length === 0) {
            const noneEl = document.createElement('p');
            noneEl.className = 'dept-notice-mini-date';
            noneEl.textContent = 'No announcements posted yet.';
            noticeContainer.appendChild(noneEl);
            return;
        }

        const list = document.createElement('ul');
        list.className = 'dept-notice-mini-list';

        deptNotices.forEach(notice => {
            const item = document.createElement('li');
            item.className = 'dept-notice-mini-item';

            const left = document.createElement('div');
            const titleStrong = document.createElement('strong');
            titleStrong.textContent = notice.title;

            const dateSpan = document.createElement('div');
            dateSpan.className = 'dept-notice-mini-date';
            dateSpan.textContent = formatReadableDate(notice.targetDate);

            left.appendChild(titleStrong);
            left.appendChild(dateSpan);
            item.appendChild(left);

            const priority = getPriorityStatus(notice.targetDate);
            if (priority.isPriority) {
                const badge = document.createElement('span');
                badge.className = 'priority-badge';
                badge.textContent = priority.label;
                item.appendChild(badge);
            }

            list.appendChild(item);
        });

        noticeContainer.appendChild(list);
    });

    if (deptSearch) {
        deptSearch.addEventListener('input', () => {
            const query = deptSearch.value.trim().toLowerCase();
            let visibleCount = 0;

            cards.forEach(card => {
                const matches = query === '' || card.innerText.toLowerCase().includes(query);
                card.style.display = matches ? 'block' : 'none';
                if (matches) visibleCount++;
            });

            if (emptyMsg) {
                emptyMsg.style.display = visibleCount === 0 ? 'block' : 'none';
            }
        });
    }
}

/* ---------------- Announcements Data & Card Builder ---------------- */

function getDefaultAnnouncements() {
    return [
        {
            id: 201,
            deptSlug: 'computer-science-engineering',
            deptName: 'Department of Computer Science and Engineering',
            icon: '💻',
            title: 'Lab Walkthrough & Code Review Session',
            faculty: 'FET Computer Science Faculty',
            targetDate: getIsoOffsetDays(2),
            body: 'Review external CSS/JS modular structure, department announcement routes, and study planner persistence.'
        },
        {
            id: 202,
            deptSlug: 'life-sciences-biotechnology',
            deptName: 'Life Sciences & Biotechnology',
            icon: '🔬',
            title: 'Research Publication on Porphyrins by Prof. Ritu Gaur & Team',
            faculty: 'Prof. Ritu Gaur (with PhD scholars Madhu & Aradhana Singh)',
            targetDate: '2025-01-14',
            body: 'Faculty and research scholars from Life Sciences & Biotechnology published research work on porphyrins.'
        },
        {
            id: 203,
            deptSlug: 'life-sciences-biotechnology',
            deptName: 'Life Sciences & Biotechnology',
            icon: '🌱',
            title: 'Plant Science Article by Dr. Ananda Mustafiz & Group',
            faculty: 'Dr. Ananda Mustafiz & Research Group',
            targetDate: '2025-02-14',
            body: 'Dr. Ananda Mustafiz and his research group published a research article in Plant Science.'
        },
        {
            id: 204,
            deptSlug: 'life-sciences-biotechnology',
            deptName: 'Life Sciences & Biotechnology',
            icon: '🧬',
            title: 'Cancer Biology Lab Study by Dr. Yuba Raj Pokharel',
            faculty: 'Dr. Yuba Raj Pokharel (Cancer Biology Laboratory)',
            targetDate: '2025-03-02',
            body: 'Published research on 5-hydroxyisatin thiosemicarbazones in the Bioorganic Chemistry Journal.'
        },
        {
            id: 205,
            deptSlug: 'life-sciences-biotechnology',
            deptName: 'Life Sciences & Biotechnology',
            icon: '🧠',
            title: 'Invited Talk at 38th SNCI Annual Meeting',
            faculty: 'Dr. Ravi Shankar Akundi',
            targetDate: '2025-03-05',
            body: 'Invited talk at the 38th Annual Meeting of the Society for Neurochemistry India (SNCI).'
        },
        {
            id: 206,
            deptSlug: 'international-studies',
            deptName: 'International Relations & Public Policy',
            icon: '🌍',
            title: '4th South Asia Conference — Paper Submission Window',
            faculty: 'Faculty of International Studies (FIS)',
            targetDate: getIsoOffsetDays(5),
            body: 'Regional cooperation, South Asian diplomacy, and policy panel submissions ahead of the December conference.'
        },
        {
            id: 207,
            deptSlug: 'social-sciences',
            deptName: 'Sociology & Sustainable Development',
            icon: '🧩',
            title: 'South Asian Social Structures & Fieldwork Colloquium',
            faculty: 'Faculty of Social Sciences (FSS)',
            targetDate: getIsoOffsetDays(10),
            body: 'Student and faculty presentations on sociological methodologies and sustainable regional development.'
        },
        {
            id: 208,
            deptSlug: 'economics-management',
            deptName: 'Economics & Management Studies',
            icon: '📊',
            title: 'South Asian Development & Quantitative Economics Workshop',
            faculty: 'Faculty of Economics & Faculty of Management',
            targetDate: getIsoOffsetDays(6),
            body: 'Analytical workshop for MA/PhD Economics and MBA/BBA-MBA students on regional economic policy.'
        },
        {
            id: 209,
            deptSlug: 'legal-studies',
            deptName: 'Department of Legal Studies',
            icon: '⚖️',
            title: 'Winter Certificate Programme on Artificial Intelligence and Law',
            faculty: 'Faculty of Legal Studies',
            targetDate: getIsoOffsetDays(14),
            body: 'Course overview and registration details for students interested in AI governance, policy, and legal frameworks.'
        },
        {
            id: 210,
            deptSlug: 'sciences-mathematics-climate',
            deptName: 'Mathematics, Physical & Chemical Sciences, Climate Change',
            icon: '🌡️',
            title: 'MS Climate Change & Sustainability Seminar',
            faculty: 'Interdisciplinary Centre on Climate Change & FMS/FPS/FCS',
            targetDate: getIsoOffsetDays(20),
            body: 'Discussion on South Asian climate resilience, sustainability policy, and quantitative modeling.'
        },
        {
            id: 211,
            deptSlug: 'arts-design-virtual',
            deptName: 'Media, Arts, Design & Virtual Campus',
            icon: '🎨',
            title: 'Visual Communication & South Asian Folk Arts Showcase',
            faculty: 'Faculty of Arts and Design & SAU Virtual Campus',
            targetDate: getIsoOffsetDays(12),
            body: 'Exhibition and orientation session for Communication Design, Vocal Music, and Online BCA (Hons) learners.'
        }
    ];
}

function getAnnouncements() {
    return safeParseArray(ANNOUNCEMENTS_STORAGE_KEY, getDefaultAnnouncements);
}

function saveAnnouncements(list) {
    safeSaveArray(ANNOUNCEMENTS_STORAGE_KEY, list);
}

function publishAnnouncement({ title, deptValue, faculty, targetDate, body, fallbackDeptSlug }) {
    const cleanTitle = String(title || '').trim();
    const cleanBody = String(body || '').trim();
    if (!cleanTitle || !cleanBody) {
        return false;
    }

    const rawDept = deptValue || fallbackDeptSlug || SAU_DEPARTMENTS[0].slug;
    const deptObj = findDepartmentByNameOrSlug(rawDept);
    const resolvedDate = targetDate && String(targetDate).trim() ? String(targetDate).trim() : getIsoOffsetDays(3);
    const notices = getAnnouncements();

    notices.unshift({
        id: Date.now(),
        deptSlug: deptObj.slug,
        deptName: deptObj.name,
        icon: deptObj.icon,
        title: cleanTitle,
        faculty: faculty && String(faculty).trim() ? String(faculty).trim() : deptObj.faculty,
        targetDate: resolvedDate,
        body: cleanBody
    });

    saveAnnouncements(notices);
    return true;
}

function createAnnouncementCard(notice, showDeptLink = true) {
    const deptObj = findDepartmentByNameOrSlug(notice.deptSlug || notice.deptName);
    const priority = getPriorityStatus(notice.targetDate);

    const card = document.createElement('div');
    card.className = `card${priority.isPriority ? ' priority-card' : ''}`;

    const topRow = document.createElement('div');
    topRow.className = 'card-top-row';

    const badge = document.createElement('span');
    badge.className = 'dept-badge';
    badge.textContent = deptObj.name;
    topRow.appendChild(badge);

    if (priority.isPriority) {
        const prioBadge = document.createElement('span');
        prioBadge.className = 'priority-badge';
        prioBadge.textContent = priority.label;
        topRow.appendChild(prioBadge);
    }

    const iconEl = document.createElement('div');
    iconEl.className = 'card-icon';
    iconEl.textContent = notice.icon || deptObj.icon || '📢';

    const titleEl = document.createElement('h3');
    titleEl.textContent = notice.title;

    const metaEl = document.createElement('p');
    metaEl.className = 'meta-text';
    const dateLabel = formatReadableDate(notice.targetDate);
    const facultyLabel = notice.faculty ? ` • ${notice.faculty}` : '';
    metaEl.textContent = `Date: ${dateLabel}${facultyLabel}`;

    const bodyEl = document.createElement('p');
    bodyEl.textContent = notice.body;

    card.appendChild(topRow);
    card.appendChild(iconEl);
    card.appendChild(titleEl);
    card.appendChild(metaEl);
    card.appendChild(bodyEl);

    if (showDeptLink) {
        const deptLink = document.createElement('a');
        deptLink.className = 'card-footer-link';
        deptLink.href = `department-announcements.html?dept=${encodeURIComponent(deptObj.slug)}`;
        deptLink.textContent = `Open ${deptObj.name} Page →`;
        card.appendChild(deptLink);
    }

    return card;
}

function populateDepartmentDropdown(selectEl, includeAllOption = false) {
    if (!selectEl) return;

    selectEl.innerHTML = '';

    if (includeAllOption) {
        const allOpt = document.createElement('option');
        allOpt.value = 'all';
        allOpt.textContent = 'All Departments';
        selectEl.appendChild(allOpt);
    }

    SAU_DEPARTMENTS.forEach(dept => {
        const opt = document.createElement('option');
        opt.value = dept.slug;
        opt.textContent = dept.name;
        selectEl.appendChild(opt);
    });
}

/* ---------------- Announcement Hub (announcements.html) ---------------- */

function initAnnouncementHub() {
    const sectionsContainer = document.getElementById('announcementSections');
    const redirectForm = document.getElementById('deptRedirectForm');
    const redirectSelect = document.getElementById('deptRedirectSelect');
    const quickLinks = document.getElementById('deptQuickLinks');
    const noticeDeptSelect = document.getElementById('noticeDept');
    const searchInput = document.getElementById('announcementSearch');
    const form = document.getElementById('announcementForm');
    const emptyMsg = document.getElementById('noAnnouncementsMsg');

    if (!sectionsContainer) return;

    populateDepartmentDropdown(redirectSelect, true);
    populateDepartmentDropdown(noticeDeptSelect, false);

    if (quickLinks) {
        quickLinks.innerHTML = '';
        SAU_DEPARTMENTS.forEach(dept => {
            const link = document.createElement('a');
            link.className = 'dept-link-pill';
            link.href = `department-announcements.html?dept=${encodeURIComponent(dept.slug)}`;
            link.textContent = dept.name;
            quickLinks.appendChild(link);
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const queryDept = urlParams.get('dept');
    let selectedDeptSlug = queryDept && SAU_DEPARTMENTS.some(d => d.slug === queryDept)
        ? queryDept
        : 'all';

    if (redirectSelect) {
        redirectSelect.value = selectedDeptSlug;
    }
    if (selectedDeptSlug !== 'all' && noticeDeptSelect) {
        noticeDeptSelect.value = selectedDeptSlug;
    }

    function renderDepartmentSections() {
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const allNotices = getAnnouncements();
        sectionsContainer.innerHTML = '';

        const departmentsToRender = selectedDeptSlug === 'all'
            ? SAU_DEPARTMENTS
            : SAU_DEPARTMENTS.filter(d => d.slug === selectedDeptSlug);

        let totalVisible = 0;

        departmentsToRender.forEach(dept => {
            const deptNotices = allNotices.filter(notice => {
                if (!noticeBelongsToDepartment(notice, dept)) return false;
                const prio = getPriorityStatus(notice.targetDate);
                const searchable = `${notice.title} ${dept.name} ${dept.faculty} ${notice.faculty || ''} ${notice.body} ${prio.label}`.toLowerCase();
                return query === '' || searchable.includes(query);
            });

            if (deptNotices.length === 0 && selectedDeptSlug === 'all' && query !== '') {
                return;
            }

            const sectionBlock = document.createElement('div');
            sectionBlock.className = 'dept-section-block';
            sectionBlock.id = `dept-section-${dept.slug}`;

            const headerRow = document.createElement('div');
            headerRow.className = 'dept-section-header';

            const heading = document.createElement('h2');
            heading.textContent = `${dept.icon} ${dept.name}`;

            const pageLink = document.createElement('a');
            pageLink.className = 'dept-link-pill';
            pageLink.href = `department-announcements.html?dept=${encodeURIComponent(dept.slug)}`;
            pageLink.textContent = 'Dedicated Department Page →';

            headerRow.appendChild(heading);
            headerRow.appendChild(pageLink);
            sectionBlock.appendChild(headerRow);

            if (deptNotices.length === 0) {
                const noneNote = document.createElement('p');
                noneNote.className = 'empty-state';
                noneNote.textContent = `No announcements in ${dept.name} yet.`;
                sectionBlock.appendChild(noneNote);
            } else {
                const list = document.createElement('ul');
                list.className = 'announcement-list';
                deptNotices.forEach(notice => {
                    const item = document.createElement('li');
                    item.appendChild(createAnnouncementCard(notice, true));
                    list.appendChild(item);
                    totalVisible++;
                });
                sectionBlock.appendChild(list);
            }

            sectionsContainer.appendChild(sectionBlock);
        });

        if (emptyMsg) {
            emptyMsg.style.display = totalVisible === 0 && query !== '' ? 'block' : 'none';
        }
    }

    if (redirectSelect) {
        redirectSelect.addEventListener('change', () => {
            selectedDeptSlug = redirectSelect.value || 'all';
            if (selectedDeptSlug !== 'all' && noticeDeptSelect) {
                noticeDeptSelect.value = selectedDeptSlug;
            }
            renderDepartmentSections();
        });
    }

    if (redirectForm && redirectSelect) {
        redirectForm.addEventListener('submit', e => {
            e.preventDefault();
            const chosenSlug = redirectSelect.value;
            if (!chosenSlug || chosenSlug === 'all') {
                redirectSelect.focus();
                return;
            }
            window.location.href = `department-announcements.html?dept=${encodeURIComponent(chosenSlug)}`;
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderDepartmentSections();
        });
    }

    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const publishedDeptSlug = document.getElementById('noticeDept')?.value;
            const published = publishAnnouncement({
                title: document.getElementById('noticeTitle')?.value,
                deptValue: publishedDeptSlug,
                faculty: document.getElementById('noticeFaculty')?.value,
                targetDate: document.getElementById('noticeTargetDate')?.value,
                body: document.getElementById('noticeBody')?.value
            });
            if (published) {
                form.reset();
                if (selectedDeptSlug !== 'all' && selectedDeptSlug !== publishedDeptSlug) {
                    selectedDeptSlug = publishedDeptSlug || 'all';
                    if (redirectSelect) redirectSelect.value = selectedDeptSlug;
                }
                if (searchInput) searchInput.value = '';
                renderDepartmentSections();
            }
        });
    }

    renderDepartmentSections();
}

/* ---------------- Single Department Announcement Page ---------------- */

function initSingleDepartmentPage() {
    const singleGrid = document.getElementById('singleDeptGrid');
    if (!singleGrid) return;

    const params = new URLSearchParams(window.location.search);
    const deptParam = params.get('dept');
    const deptObj = findDepartmentByNameOrSlug(deptParam);

    const badgeEl = document.getElementById('singleDeptBadge');
    const titleEl = document.getElementById('singleDeptTitle');
    const descEl = document.getElementById('singleDeptDesc');
    const facultyEl = document.getElementById('singleDeptFaculty');
    const formHeadingEl = document.getElementById('singleDeptFormHeading');
    const emptyEl = document.getElementById('singleDeptEmpty');
    const singleForm = document.getElementById('singleDeptForm');
    const switchForm = document.getElementById('singleDeptSwitchForm');
    const switchSelect = document.getElementById('singleDeptSwitchSelect');

    document.title = `${deptObj.name} Announcements - SouthAsianPulse (SAU)`;
    if (badgeEl) badgeEl.textContent = deptObj.faculty;
    if (titleEl) titleEl.textContent = `${deptObj.name} — Announcements`;
    if (descEl) descEl.textContent = deptObj.description;
    if (facultyEl) facultyEl.textContent = `Faculty Highlights: ${deptObj.facultyHighlights}`;
    if (formHeadingEl) formHeadingEl.textContent = `Post Notice for ${deptObj.name}`;

    if (switchSelect) {
        populateDepartmentDropdown(switchSelect, false);
        switchSelect.value = deptObj.slug;
    }

    if (switchForm && switchSelect) {
        switchForm.addEventListener('submit', e => {
            e.preventDefault();
            window.location.href = `department-announcements.html?dept=${encodeURIComponent(switchSelect.value)}`;
        });
    }

    function renderDeptNotices() {
        const notices = getAnnouncements().filter(n => noticeBelongsToDepartment(n, deptObj));
        singleGrid.innerHTML = '';

        notices.forEach(notice => {
            singleGrid.appendChild(createAnnouncementCard(notice, false));
        });

        if (emptyEl) {
            emptyEl.style.display = notices.length === 0 ? 'block' : 'none';
        }
    }

    if (singleForm) {
        singleForm.addEventListener('submit', e => {
            e.preventDefault();
            const published = publishAnnouncement({
                title: document.getElementById('deptNoticeTitle')?.value,
                deptValue: deptObj.slug,
                fallbackDeptSlug: deptObj.slug,
                faculty: document.getElementById('deptNoticeFaculty')?.value,
                targetDate: document.getElementById('deptNoticeDate')?.value,
                body: document.getElementById('deptNoticeBody')?.value
            });
            if (published) {
                singleForm.reset();
                renderDeptNotices();
            }
        });
    }

    renderDeptNotices();
}

/* ---------------- Study Planner Checklist (planner.html) ---------------- */

function initPlanner() {
    const taskForm = document.getElementById('taskForm');
    const taskList = document.getElementById('taskList');
    const groupButtons = document.querySelectorAll('.group-btn');

    if (!taskForm || !taskList) return;

    let currentGroupMode = 'none';

    renderTasks(currentGroupMode);

    taskForm.addEventListener('submit', e => {
        e.preventDefault();
        const input = document.getElementById('taskInput');
        const subjectInput = document.getElementById('taskSubject');
        const dateInput = document.getElementById('taskDate');

        if (!input || input.value.trim() === '') return;

        const subjectValue = subjectInput && subjectInput.value.trim()
            ? subjectInput.value.trim()
            : 'General';

        const tasks = getTasks();
        tasks.push({
            id: Date.now(),
            text: input.value.trim(),
            subject: subjectValue,
            date: dateInput && dateInput.value ? dateInput.value : 'No due date',
            completed: false
        });

        saveTasks(tasks);
        input.value = '';
        if (subjectInput) subjectInput.value = '';
        if (dateInput) dateInput.value = '';
        renderTasks(currentGroupMode);
    });

    groupButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            groupButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentGroupMode = btn.getAttribute('data-group') || 'none';
            renderTasks(currentGroupMode);
        });
    });

    taskList.addEventListener('change', e => {
        if (e.target.classList.contains('task-checkbox')) {
            const id = Number(e.target.getAttribute('data-id'));
            toggleTask(id);
            renderTasks(currentGroupMode);
        }
    });

    taskList.addEventListener('click', e => {
        if (e.target.classList.contains('delete-btn')) {
            const id = Number(e.target.getAttribute('data-id'));
            deleteTask(id);
            renderTasks(currentGroupMode);
        }
    });
}

function getTasks() {
    return safeParseArray(PLANNER_STORAGE_KEY, () => [
        {
            id: 1,
            text: 'Finalize SouthAsianPulse project walkthrough & demo',
            subject: 'CSE / Web Dev',
            date: getIsoOffsetDays(2),
            completed: false
        },
        {
            id: 2,
            text: 'Check SAU department pages & faculty highlights',
            subject: 'SAU Portal',
            date: getIsoOffsetDays(1),
            completed: true
        }
    ]);
}

function saveTasks(tasks) {
    safeSaveArray(PLANNER_STORAGE_KEY, tasks);
}

function createChecklistCard(task) {
    const item = document.createElement('div');
    item.className = `card task-card-item${task.completed ? ' completed' : ''}`;

    const label = document.createElement('label');
    label.className = 'task-label';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = Boolean(task.completed);
    checkbox.setAttribute('data-id', task.id);

    const textWrapper = document.createElement('div');

    const titleRow = document.createElement('div');
    titleRow.className = 'task-title-row';

    const title = document.createElement('h3');
    title.className = 'task-title';
    title.textContent = task.text;

    const subjectBadge = document.createElement('span');
    subjectBadge.className = 'subject-badge';
    subjectBadge.textContent = task.subject || 'General';

    titleRow.appendChild(title);
    titleRow.appendChild(subjectBadge);

    const due = document.createElement('p');
    due.className = 'task-due';
    due.textContent = `Due: ${task.date}`;

    textWrapper.appendChild(titleRow);
    textWrapper.appendChild(due);

    label.appendChild(checkbox);
    label.appendChild(textWrapper);

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn btn-secondary delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('data-id', task.id);

    item.appendChild(label);
    item.appendChild(deleteBtn);

    return item;
}

function renderTasks(groupMode = 'none') {
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');
    if (!taskList) return;

    const tasks = getTasks();
    taskList.innerHTML = '';

    if (tasks.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    if (groupMode === 'status') {
        const groups = [
            { label: 'Pending Tasks', items: tasks.filter(t => !t.completed) },
            { label: 'Completed Tasks', items: tasks.filter(t => t.completed) }
        ];

        groups.forEach(group => {
            if (group.items.length === 0) return;
            const block = document.createElement('div');
            block.className = 'group-block';

            const heading = document.createElement('div');
            heading.className = 'group-heading';
            heading.textContent = `${group.label} (${group.items.length})`;
            block.appendChild(heading);

            group.items.forEach(task => block.appendChild(createChecklistCard(task)));
            taskList.appendChild(block);
        });
        return;
    }

    if (groupMode === 'subject') {
        const subjectMap = new Map();
        tasks.forEach(task => {
            const subj = task.subject || 'General';
            if (!subjectMap.has(subj)) {
                subjectMap.set(subj, []);
            }
            subjectMap.get(subj).push(task);
        });

        subjectMap.forEach((items, subj) => {
            const block = document.createElement('div');
            block.className = 'group-block';

            const heading = document.createElement('div');
            heading.className = 'group-heading';
            heading.textContent = `${subj} (${items.length})`;
            block.appendChild(heading);

            items.forEach(task => block.appendChild(createChecklistCard(task)));
            taskList.appendChild(block);
        });
        return;
    }

    tasks.forEach(task => {
        taskList.appendChild(createChecklistCard(task));
    });
}

function toggleTask(id) {
    const tasks = getTasks().map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks(tasks);
}

function deleteTask(id) {
    const tasks = getTasks().filter(task => task.id !== id);
    saveTasks(tasks);
}