// Import icons cho giao diện
import { FaSearch, FaUser, FaGraduationCap, FaBookOpen } from 'react-icons/fa'
// Import ChatWidget
import ChatWidget from './ChatWidget'

// Hệ thống chatbot học tập
const LearningChatbotUI = () => {
  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="top-bar">
            <div className="logo">EduSmart</div>
            <div className="search-bar">
              <input type="text" placeholder="Tìm khoá học..." />
              <button>
                <FaSearch />
              </button>
            </div>
            <div className="nav-icons">
              <a href="#account">
                <FaUser size={20} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <nav className="nav-bar">
            <ul>
              <li><a href="#" className="active">Trang chủ</a></li>
              <li><a href="#">Khoá học</a></li>
              <li><a href="#">Giảng viên</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Liên hệ</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero section */}
      <main>
        <div className="hero">
          <div className="container">
            <h1>Trợ Lý Học Tập AI</h1>
            <p>
              Hỏi đáp mọi lúc – mọi nơi, nhận giải thích chi tiết và bài tập thực hành
              ngay trong quá trình học.
            </p>
            <button>Bắt đầu học</button>
          </div>
        </div>

        {/* Course showcase */}
        <section className="courses container">
          <h2>Khoá học nổi bật</h2>
          <div className="course-grid">
            <div className="course-card">
              <FaGraduationCap size={40} />
              <h3>Lập trình Java cơ bản</h3>
              <p>Học từ con số 0 đến OOP trong Java.</p>
            </div>
            <div className="course-card">
              <FaBookOpen size={40} />
              <h3>Phân tích dữ liệu Python</h3>
              <p>Thực hành với Pandas, NumPy và Matplotlib.</p>
            </div>
            <div className="course-card">
              <FaGraduationCap size={40} />
              <h3>AI & Machine Learning</h3>
              <p>Xây dựng mô hình học máy cùng trợ lý AI.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-column">
              <h3>Khoá học</h3>
              <ul>
                <li><a href="#">Công nghệ</a></li>
                <li><a href="#">Kinh doanh</a></li>
                <li><a href="#">Thiết kế</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h3>Hỗ trợ</h3>
              <ul>
                <li><a href="#">Liên hệ</a></li>
                <li><a href="#">Hỏi đáp</a></li>
                <li><a href="#">Chính sách hoàn học phí</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h3>Về EduSmart</h3>
              <ul>
                <li><a href="#">Giới thiệu</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Cơ hội nghề nghiệp</a></li>
              </ul>
            </div>
          </div>

          <div className="copyright">
            &copy; {new Date().getFullYear()} EduSmart. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Chatbot AI */}
      <ChatWidget />
    </>
  )
}

export default LearningChatbotUI
