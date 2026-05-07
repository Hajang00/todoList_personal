import { useState } from 'react';
import styles from './App.module.css';

function App() {
  // 할 일 목록 상태
  const [todos, setTodos] = useState([
    { id: 1, text: '리액트 프로젝트 UI 설계', category: 'Study', priority: 'High', date: '2026-04-25', completed: false },
    { id: 2, text: '매일 30분 운동하기', category: 'Health', priority: 'Low', date: '2026-05-02', completed: true },
    { id: 3, text: '주간 회의 자료 준비', category: 'Work', priority: 'Medium', date: '2026-05-01', completed: false },
  ]);

  // 입력값 관리를 위한 상태
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // 필터 상태
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [sortType, setSortType] = useState('마감일 순');

  // 중요도 정렬
  const priorityWeights = { High: 3, Medium: 2, Low: 1 };

  // 검색
  const [searchTerm, setSearchTerm] = useState('');

  // [기능] 할 일 추가
  const handleAddTodo = () => {
    // 유효성 검사: 하나라도 입력되지 않으면 추가 안 함
    if (!inputText || !selectedCategory || !selectedPriority || !selectedDate) {
      alert('모든 항목을 입력하거나 선택해주세요!');
      return;
    }

    const newTodo = {
      id: Date.now(),
      text: inputText,
      category: selectedCategory,
      priority: selectedPriority,
      date: selectedDate,
      completed: false,
    };

    setTodos([newTodo, ...todos]); // 새 항목을 맨 위로 추가
    
    // 입력창 초기화
    setInputText('');
    setSelectedCategory('');
    setSelectedPriority('');
    setSelectedDate('');
  };

  // [기능] 필터링 및 정렬 통합 로직
  const filteredTodos = todos
    .filter(todo => {
      const matchSearch = todo.text.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = categoryFilter === '전체' || categoryFilter.includes(todo.category);
      const matchStatus = 
        statusFilter === '전체' || 
        (statusFilter === '진행 중' && !todo.completed) || 
        (statusFilter === '완료' && todo.completed);
      return matchSearch && matchCategory && matchStatus;
    })
    .sort((a, b) => {
      if (sortType === 'endDate') {
        return new Date(a.date) - new Date(b.date); // 빠른 날짜순
      } else if (sortType === 'priority') {
        return priorityWeights[b.priority] - priorityWeights[a.priority]; // 높은 중요도순
      }
      return 0;
    });

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
            <span className={styles.statNumber} style={{ color: '#22C55E' }}>{todos.filter(t => t.completed).length}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>진행 중</span>
            <span className={styles.statNumber} style={{ color: '#FFB800' }}>{todos.filter(t => !t.completed).length}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>오늘 마감</span>
            <span className={styles.statNumber} style={{ color: '#8B5CF6' }}>3</span>
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
          <div className={styles.searchRow}>
            <div className={styles.leftBlock}>
              <input className={styles.searchInput} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="할 일 검색..." />
            </div>
            <div className={styles.rightBlock}>
              <select className={styles.sortSelect} value={sortType} onChange={(e) => setSortType(e.target.value)}>
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
            <div key={todo.id} className={styles.todoItem}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox" 
                  checked={todo.completed} 
                  onChange={() => {
                    setTodos(todos.map(t => t.id === todo.id ? {...t, completed: !t.completed} : t));
                  }} 
                />
                <span className={`${styles.todoText} ${todo.completed ? styles.completedText : ''}`}>
                  {todo.text}
                </span>
                
                <span className={`${styles.tag} ${styles.category}`}>
                  {todo.category}
                </span>
                
                <span className={`${styles.tag} ${styles[`priority${todo.priority}`]}`}>
                  {todo.priority}
                </span>
              </div>
              <div className={styles.dateCaption}>{todo.date}</div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default App;