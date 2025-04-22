import AuthPage from './components/AuthPage';
import TaskPage from './components/TaskPage';
import { useAuth } from './context/AuthContext';

function App() {
  const { currentUser } = useAuth();

  // if logged in
  if (currentUser) {
    return (
      <TaskPage />
    );
  }
  else {
    return (
      <AuthPage />
    );
  }
}

export default App
