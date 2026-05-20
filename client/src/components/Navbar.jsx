import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaTicketAlt } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-3 text-2xl font-extrabold tracking-tight"
                    >
                        <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-sm">
                            <FaTicketAlt className="text-lg" />
                        </div>
                        <span className="text-gray-900">reservIT</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            to="/"
                            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Events
                        </Link>

                        {user ? (
                            <>
                                <Link
                                    to={user.role === 'admin' ? '/admin' : '/dashboard'}
                                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Dashboard
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-black shadow-sm transition-all"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden">
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Logout
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;