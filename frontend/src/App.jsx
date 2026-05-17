import { useState, useEffect } from 'react';
import styles from './App.module.css';

const API = 'http://localhost:3001';

function App() {
  const [todos, setTodos] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 입력값 관리를 위한 상태
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // 필터 상태
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [sortType, setSortType] = useState('endDate');
  const [searchTerm, setSearchTerm] = useState('');

  // 중요도 정렬 가중치
  const priorityWeights = { High: 3, Medium: 2, Low: 1 };

  // DB에서 할 일 목록 불러오기
  useEffect(() => {
    fetch(`${API}/tasks`)
      .then(r => r.json())
      .then(data => setTodos(data))
      .catch(err => console.error('불러오기 실패:', err));
  }, []);

  // [기능] 할 일 추가 → DB POST
  const handleAddTodo = async () => {
    // 유효성 검사: 하나라도 입력되지 않으면 추가 안 함
    if (!inputText || !selectedCategory || !selectedPriority || !selectedDate) {
      alert('모든 항목을 입력하거나 선택해주세요!');
      return;
    }
    // DB에 새 할 일 저장
    try {
      const res = await fetch(`${API}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_name: inputText,
          category: selectedCategory,
          priority: selectedPriority,
          due_date: selectedDate,
          is_completed: false,
        }),
      });

      const saved = await res.json();// 저장된 할 일 데이터 받아오기
      setTodos(prev => [saved, ...prev]);// 새로 추가된 할 일을 목록 맨 앞에 추가
      setInputText(''); setSelectedCategory(''); setSelectedPriority(''); setSelectedDate('');// 입력 필드 초기화
    } 
    // 에러 처리
    catch (err) {
      console.error('추가 실패:', err);
    }
  };

  // [기능] 완료 토글 → DB PUT
  const handleToggle = async (todo) => {
    // DB에 완료 상태 업데이트
    try {
      const res = await fetch(`${API}/tasks/${todo._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },// JSON 형식으로 데이터 전송
        body: JSON.stringify({ is_completed: !todo.is_completed }), // 체크박스 클릭 시 현재 상태의 반대로 업데이트
      });
      const updated = await res.json(); // 업데이트된 할 일 데이터 받아오기
      setTodos(todos.map(t => t._id === todo._id ? updated : t));// 업데이트된 데이터로 교체하여 상태 갱신
    } 
    // 에러 처리
    catch (err) {
      console.error('토글 실패:', err);
    }
  };

 // [기능] 삭제 → DB DELETE
  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
      setTodos(todos.filter(t => t._id !== id)); // 삭제된 할 일을 목록에서 제거
    } 
    // 에러 처리
    catch (err) {
      console.error('삭제 실패:', err);
    }
  };

  // [기능] 필터링 + 검색 + 정렬
  const filteredTodos = todos
    .filter(todo => {
      const matchSearch = (todo.task_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === '전체' || categoryFilter.includes(todo.category);
      const matchStatus =
        statusFilter === '전체' ||
        (statusFilter === '진행 중' && !todo.is_completed) ||
        (statusFilter === '완료' && todo.is_completed);

      return matchSearch && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      if (sortType === 'endDate') {
        return new Date(a.due_date) - new Date(b.due_date);
      }
      if (sortType === 'priority') {
        return priorityWeights[b.priority] - priorityWeights[a.priority];
      }
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  // 오늘 날짜
  const today = new Date().toISOString().slice(0, 10);
  
  // 오늘 해야할 할 일
  const todayTodos = todos.filter(
    t => (t.due_date || '').slice(0, 10) === today && !t.is_completed
  );

  // 현재 날짜 포맷팅
  const formatDate = `${new Date().getFullYear()}년 ${new Date().getMonth() + 1}월 ${new Date().getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][new Date().getDay()]})`;

  return (
    <div className={`${styles.wrapper} ${isDarkMode ? styles.dark : ''}`}>
      <div className={styles.appContainer}>
        {/* ===== HEADER ===== */}
        <header className={styles.topHeader}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.appTitle}>Daily Flow</h1>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.dateDisplay}>Today:  {formatDate}</div>
              <button 
                className={styles.darkModeToggle}
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>
        </header>

        {/* ===== MAIN CONTENT ===== */}
        <div className={styles.mainContent}>
          {/* LEFT PANEL */}
          <aside className={styles.leftPanel}>
            {/* 할 일 추가 섹션 */}
            <div className={styles.addSection}>
              <h2 className={styles.panelTitle}>새 일정 추가</h2>
              <input 
                className={styles.mainInput} 
                placeholder="할 일을 입력하세요..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className={styles.optionsRow}>
                <select 
                  className={styles.selectBox} 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">카테고리</option>
                  <option value="Study">Study</option>
                  <option value="Work">Work</option>
                  <option value="Health">Health</option>
                  <option value="Personal">Personal</option>
                </select>

                <div className={styles.priorityGroup}>
                  {['High', 'Medium', 'Low'].map((p) => (
                    <button 
                      key={p}
                      type="button"
                      className={`${styles.priorityBtn} ${selectedPriority === p ? styles.priorityBtnActive : ''}`}
                      onClick={() => setSelectedPriority(p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <input 
                  type="date" 
                  className={styles.selectBox} 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
              <button className={styles.addBtn} onClick={handleAddTodo}>추가하기</button>
            </div>

            {/* 필터 섹션 */}
            <div className={styles.filterSection}>
              <h2 className={styles.panelTitle}>필터</h2>
              
              <div className={styles.filterGroup}>
                <label>카테고리</label>
                <div className={styles.buttonGroup}>
                  {['전체', 'Study', 'Work', 'Health', 'Personal'].map((cat) => (
                    <button 
                      key={cat}
                      className={`${styles.filterBtn} ${categoryFilter === cat || categoryFilter.includes(cat) ? styles.filterBtnActive : ''}`}
                      onClick={() => setCategoryFilter(cat === '전체' ? '전체' : cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label>상태</label>
                <div className={styles.buttonGroup}>
                  {['전체', '진행 중', '완료'].map((status) => (
                    <button 
                      key={status}
                      className={`${styles.filterBtn} ${statusFilter === status ? styles.filterBtnActive : ''}`}
                      onClick={() => setStatusFilter(status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.filterGroup}>
                <label>검색</label>
                <input
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="검색..."
                />
              </div>

              <div className={styles.filterGroup}>
                <label>정렬</label>
                <select
                  className={styles.sortSelect}
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value)}
                >
                  <option value="endDate">마감일 순</option>
                  <option value="priority">중요도 순</option>
                  <option value="startDate">생성일 순</option>
                </select>
              </div>
            </div>
          </aside>

          {/* RIGHT PANEL - 오늘 대시보드 */}
          <section className={styles.rightPanel}>
            <div className={styles.dashboardHeader}>
              <h2 className={styles.dashboardTitle}>오늘의 일정</h2>
            </div>

            <div className={styles.dashboardStats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{todayTodos.length}</span>
                <span className={styles.statLabel}>해야할 일</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{todayTodos.filter(t => t.is_completed).length}</span>
                <span className={styles.statLabel}>완료</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>{todayTodos.filter(t => !t.is_completed).length}</span>
                <span className={styles.statLabel}>진행중</span>
              </div>
            </div>

            <div className={styles.todayList}>
              <h3 className={styles.todayListTitle}>해야할 일</h3>
              {todayTodos.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>오늘 할 일이 없습니다! 🎉</p>
                </div>
              ) : (
                todayTodos.map(todo => (
                  <div key={todo._id} className={styles.todayItem}>
                    <input 
                      type="checkbox" 
                      checked={todo.is_completed} 
                      onChange={() => handleToggle(todo)} 
                      className={styles.checkbox}
                    />
                    <div className={styles.todoContent}>
                      <span className={styles.todoName}>{todo.task_name}</span>
                      <div className={styles.tagGroup}>
                        <span className={`${styles.tag} ${styles.categoryTag}`}>
                          {todo.category}
                        </span>
                        <span className={`${styles.tag} ${styles[`priority${todo.priority}`]}`}>
                          {todo.priority}
                        </span>
                      </div>
                    </div>
                    <button 
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(todo._id)}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* ===== FOOTER - 모든 일정 ===== */}
        <footer className={styles.footerSection}>
          <div className={styles.footerHeader}>
            <h2>모든 일정 ({filteredTodos.length})</h2>
          </div>

          <div className={styles.footerStats}>
            <div className={styles.footerStatItem}>
              <span className={styles.footerStatValue}>{filteredTodos.length}</span>
              <span className={styles.footerStatLabel}>전체</span>
            </div>
            <div className={styles.footerStatItem}>
              <span className={styles.footerStatValue}>{filteredTodos.filter(t => t.is_completed).length}</span>
              <span className={styles.footerStatLabel}>완료</span>
            </div>
            <div className={styles.footerStatItem}>
              <span className={styles.footerStatValue}>{filteredTodos.filter(t => !t.is_completed).length}</span>
              <span className={styles.footerStatLabel}>진행중</span>
            </div>
          </div>

          <div className={styles.allTodosList}>
            {filteredTodos.length === 0 ? (
              <div className={styles.emptyState}>
                <p>일정이 없습니다.</p>
              </div>
            ) : (
              filteredTodos.map(todo => (
                <div key={todo._id} className={`${styles.todoRow} ${todo.is_completed ? styles.completed : ''}`}>
                  <input 
                    type="checkbox" 
                    checked={todo.is_completed} 
                    onChange={() => handleToggle(todo)} 
                    className={styles.checkboxFooter}
                  />
                  <span className={styles.todoName}>{todo.task_name}</span>
                  <span className={`${styles.tag} ${styles.categoryTag}`}>{todo.category}</span>
                  <span className={`${styles.tag} ${styles[`priority${todo.priority}`]}`}>{todo.priority}</span>
                  <span className={styles.dueDate}>{todo.due_date?.slice(0, 10)}</span>
                  <button 
                    className={styles.deleteBtn}
                    onClick={() => handleDelete(todo._id)}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;