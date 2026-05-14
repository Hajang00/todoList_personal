import { useState, useEffect } from 'react';
import styles from './App.module.css';

const API = 'http://localhost:3001';

function App() {
  const [todos, setTodos] = useState([]);

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

  const today = new Date().toISOString().slice(0, 10);
  const todayDueCount = todos.filter(
    t => (t.due_date || '').slice(0, 10) === today && !t.is_completed
  ).length;

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>ClearTodo</h1>
            <p className={styles.subtitle}>오늘 할 일을 계획하고 완벽하게 달성해보세요.</p>
          </div>
          <div className={styles.headerDate}>☀️ 2026년 4월 25일 (토)</div>
        </header>

        <section className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>전체 할 일</span>
            <span className={styles.statNumber} style={{ color: '#6C83FF' }}>{todos.length}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>완료한 일</span>
            <span className={styles.statNumber} style={{ color: '#22C55E' }}>{todos.filter(t => t.is_completed).length}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>진행 중</span>
            <span className={styles.statNumber} style={{ color: '#FFB800' }}>{todos.filter(t => !t.is_completed).length}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>오늘 마감</span>
            <span className={styles.statNumber} style={{ color: '#8B5CF6' }}>{todayDueCount}</span>
          </div>
        </section>

        <section className={styles.filterSection}>
          <div className={styles.filterHeader}>필터</div>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>카테고리</span>
              <div className={styles.filterButtons}>
                {['전체', '🔵 Study', '🟠 Work', '🟢 Health', '🟣 Personal'].map((cat) => (
                  <button 
                    key={cat}
                    className={`${styles.filterBtn} ${categoryFilter === cat ? styles.filterBtnActive : ''}`}
                    onClick={() => setCategoryFilter(cat)}
                  >
                  {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>상태</span>
              <div className={styles.filterButtons}>
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
          </div>
          {/* [기능] 검색 + 정렬 UI */}
          <div className={styles.searchRow}>
            <div className={styles.leftBlock}>
              <input
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="할 일 검색..."
              />
            </div>
            <div className={styles.rightBlock}>
              <select
                className={styles.sortSelect}
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
              >
                <option value="endDate">정렬: 마감일 순</option>
                <option value="startDate">정렬: 생성일 순</option>
                <option value="priority">정렬: 중요도 순</option>
              </select>
            </div>
          </div>          
        </section>

        <section className={styles.addCard}>
          <h2 className={styles.sectionTitle}>할 일 추가</h2>
          <input 
            className={styles.inputMain} 
            placeholder="할 일을 입력하세요..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <div className={styles.addOptionsRow}>
            <div className={styles.selectors}>
              <select 
                className={styles.selectBox} 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">카테고리 선택</option>
                <option value="Study">Study</option>
                <option value="Work">Work</option>
                <option value="Health">Health</option>
                <option value="Personal">Personal</option>
              </select>

              <div style={{ display: 'flex', gap: '8px' }}>
                {['High', 'Medium', 'Low'].map((p) => (
                  <button 
                    key={p}
                    type="button"
                    className={`${styles.priorityBtn} ${selectedPriority === p ? styles[`priority${p}`] : ''}`}
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
            <button className={styles.plusButton} onClick={handleAddTodo}>+</button>
          </div>
        </section>

        <section>
          <h2 className={styles.sectionTitle}>
            전체 할 일 <span style={{ color: '#6C83FF' }}>{filteredTodos.length}</span>
          </h2>
          {filteredTodos.map(todo => (
            <div key={todo._id} className={styles.todoItem}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox" 
                  checked={todo.is_completed} 
                  onChange={() => handleToggle(todo)} 
                />
                <span className={`${styles.todoText} ${todo.is_completed ? styles.completedText : ''}`}>
                  {todo.task_name}
                </span>
                
                <span className={`${styles.tag} ${styles.category}`}>
                  {todo.category}
                </span>
                
                <span className={`${styles.tag} ${styles[`priority${todo.priority}`]}`}>
                  {todo.priority}
                </span>
              </div>
              <div className={styles.dateCaption}>{todo.due_date?.slice(0, 10)}</div>
              {/* [기능] 삭제 버튼 */}
              <button onClick={() => handleDelete(todo._id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>delete</button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default App;