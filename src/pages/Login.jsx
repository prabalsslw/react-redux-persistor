import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, errorClean } from '../redux/reducers/auth/authSlice';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState(''); // For client-side validation
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Get auth state from Redux
    const { isLoading, errorMessage, error, isAuthenticated } = useSelector((state) => state.authentication);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                dispatch(errorClean());
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [error, dispatch]);

    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            navigate('/dashboard'); // Redirect if already logged in
        }
    }, [isAuthenticated, isLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');
        
        // Client-side validation
        if (!username.trim() || !password.trim()) {
            setLocalError('Please enter both username and password');
            return;
        }

        try {
            const result = await dispatch(loginUser({ username, password }));
            
            // Check the action result
            if (isAuthenticated) {
                navigate('/dashboard');
            } 
            // No need for else-if rejected case here because:
            // - The error is already stored in Redux state (authError)
            // - It will be displayed automatically in the JSX
            
        } catch (err) {
            // This will catch unexpected errors (network issues, etc.)
            console.error("Unexpected login error:", err);
            setLocalError('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
            <h2>Login</h2>
            {/* <pre>{JSON.stringify({ errorMessage, error }, null, 2)}</pre> */}
            {(localError || errorMessage) && (
                <div style={{ 
                    color: 'red', 
                    marginBottom: '15px',
                    padding: '10px',
                    backgroundColor: '#ffebee',
                    borderRadius: '4px'
                }}>
                    {localError || errorMessage}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>
                        Username/Email:
                    </label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setLocalError(''); // Clear error when typing
                        }}
                        placeholder='Username/Email'
                        required
                        style={{ 
                            width: '100%', 
                            padding: '8px',
                            border: localError ? '1px solid red' : '1px solid #ccc'
                        }}
                        disabled={isLoading}
                    />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
                        Password:
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setLocalError(''); // Clear error when typing
                        }}
                        placeholder='Password'
                        required
                        style={{ 
                            width: '100%', 
                            padding: '8px',
                            border: localError ? '1px solid red' : '1px solid #ccc'
                        }}
                        disabled={isLoading}
                    />
                </div>
                
                <button 
                    type="submit" 
                    style={{ 
                        width: '100%', 
                        padding: '10px', 
                        backgroundColor: isLoading ? '#cccccc' : '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        borderRadius: '4px',
                        fontSize: '16px'
                    }}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span style={{ marginRight: '8px' }}>⏳</span>
                            Logging in...
                        </>
                    ) : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default Login;