import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { logout, refreshTokenThnk, errorSetup } from '../redux/reducers/auth/authSlice';
import { store } from '../redux/store'; // Import your Redux store

export const ProtectedRoute = () => {
    const { 
        isAuthenticated, 
        isLoading, 
        expiresIn, 
        lastLogin, 
        refreshTokenExpiresAt,
        token,
        errorMessage
    } = useSelector((state) => state.authentication);
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isRehydrated, setIsRehydrated] = useState(false);

    // Track Redux Persist rehydration
    useEffect(() => {
        if (store.getState().authentication._persist?.rehydrated) {
            setIsRehydrated(true);
            return;
        }

        const unsubscribe = store.subscribe(() => {
            if (store.getState().authentication._persist?.rehydrated) {
                setIsRehydrated(true);
                unsubscribe();
            }
        });
        
        return () => unsubscribe();
    }, []);


    useEffect(() => {
        if (!isRehydrated || !isAuthenticated) return;

        const nowInSeconds = Math.floor(Date.now() / 1000);
        const loginTime = new Date(lastLogin).getTime() / 1000;
        const elapsedTime = nowInSeconds - loginTime;
        const bufferTime = 10; // 1 minute buffer

        // console.warn("Time and Logic", {
        //     nowInSeconds,
        //     lastLogin,
        //     refreshTokenExpiresAt,
        //     loginTime,
        //     elapsedTime,
        //     bufferTime,
        //     expiresIn,
        //     elapsExpiresMinusBuffer: elapsedTime > expiresIn - bufferTime,
        //     nowtimeSmallerrefreshTokenExpiresAt: nowInSeconds < refreshTokenExpiresAt
        // });

        if (elapsedTime > expiresIn - bufferTime && nowInSeconds < refreshTokenExpiresAt) {
            dispatch(refreshTokenThnk());
        }
        else if (nowInSeconds >= refreshTokenExpiresAt) {
            console.log('DISPATCHING errorSetup');
            dispatch(logout());
            dispatch(errorSetup({
			    errorMessage : 'Session Expired!'
            }));
            navigate('/', { replace: true });
        }
    }, [isRehydrated, isAuthenticated, dispatch, navigate, lastLogin, expiresIn, refreshTokenExpiresAt]);

    // Debug logs
    // console.log('Current auth state:', {
    //     isAuthenticated,
    //     isLoading,
    //     isRehydrated,
    //     lastLogin,
    //     expiresIn,
    //     refreshTokenExpiresAt,
    //     hasToken: !!token,
    //     rehydrated: store.getState().authentication._persist?.rehydrated
    // });

    // Only show loading during initial rehydration
    if (!isRehydrated) {
        return <div>Loading...</div>;
    }

    // Handle authenticated state after rehydration
    if (isAuthenticated) {
        return <Outlet />;
    }

    return <Navigate to="/" replace />;
};