import React, { useState, useEffect, FormEvent, ReactNode, createContext, useContext } from 'react';
import { Routes, Route, Link, NavLink, useLocation, useNavigate, Navigate, Outlet } from 'react-router-dom';
import * as api from './services/databaseservice';
import AdminBookingsPage from './admin-app/AdminBookingsPage';

// --- 1. TYPE DEFINITIONS ---
type BookingStatus = 'Pending' | 'Approved' | 'Rejected';

interface Booking {
    id: number;
    bookingNumber: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    service: string;
    date: string;
    time: string;
    status: BookingStatus;
}

interface Password {
    id: number;
    password: string;
}

interface Service {
    id: string;
    title: string;
    description: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    price: string;
}

interface Cleaner {
    name: string;
    role: string;
    bio: string;
    imageUrl: string;
    contact: string;
}

// --- 1.5. AUTHENTICATION ---
interface AuthContextType {
    isAdmin: boolean;
    passwords: { id: number; password: string }[];
    login: (password: string) => boolean;
    logout: () => void;
    addPassword: (password: string) => Promise<boolean>;
    deletePassword: (id: number) => Promise<boolean>;   // ✅ now takes id
}

const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState<boolean>(() => sessionStorage.getItem('isAdmin') === 'true');
    const [passwords, setPasswords] = useState<Password[]>([]);


    useEffect(() => {
        const fetchPasswords = async () => {
            const fetchedPasswords = await api.getPasswords();
            setPasswords(fetchedPasswords);
        };
        fetchPasswords();
    }, []);

    const login = (password: string): boolean => {
        if (passwords.some(p => p.password === password)) {   // ✅ check against object.password
            sessionStorage.setItem('isAdmin', 'true');
            setIsAdmin(true);
            return true;
        }
        return false;
    };


    const logout = () => {
        sessionStorage.removeItem('isAdmin');
        setIsAdmin(false);
    };

    const addPassword = async (password: string): Promise<boolean> => {
        if (!password || passwords.some(p => p.password === password)) return false;

        // ❌ don't send id
        const newPw = { password };

        const createdPw = await api.addPassword(newPw); // backend returns created AdminPassword
        if (createdPw) {
            setPasswords(prev => [...prev, createdPw]); // save returned object with id
            return true;
        }
        return false;
    };


    const deletePassword = async (id: number): Promise<boolean> => {
        if (passwords.length <= 1) return false;
        const success = await api.deletePassword(id);
        if (success) setPasswords(prev => prev.filter(p => p.id !== id));
        return success;
    };



    return (
        <AuthContext.Provider
            value={{
                isAdmin,
                passwords, // keep as array of {id, password}
                login,
                logout,
                addPassword,
                deletePassword
            }}
        >
            {children}
        </AuthContext.Provider>

    );
};


const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};


// --- 2. ICONS (as components) ---
const SparkleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>);
const DeepCleanIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M4 17v4m-2-2h4m1-15l4.286 4.286-1.06 1.06-4.286-4.286a2 2 0 012.828-2.828l4.286 4.286L20 4M6 18l4.286-4.286-1.06-1.06L5 16.94a2 2 0 002.828 2.828l4.286-4.286L20 20" /></svg>);
const CarpetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 12h16M4 16h16" /></svg>);
const KitchenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0h-2M7 9H5m12 0a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2m12 0v-2" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6" /></svg>);
const BathroomIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22a10 10 0 110-20 10 10 0 010 20zm0-18v.01M12 8a4 4 0 00-4 4h8a4 4 0 00-4-4zm0 6a2 2 0 110 4 2 2 0 010-4z" /></svg>);
const WindowIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4V4zm0 8h16M12 4v16" /></svg>);
const OfficeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v-4a2 2 0 012-2h10a2 2 0 012 2v4M8 11V9a4 4 0 118 0v2" /></svg>);
const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>);
const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>);
const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" {...props}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>);
const PhoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" {...props}><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>);

// --- 5. DATA CONSTANTS ---

const SERVICES_DATA: Service[] = [
    { id: 'deep-cleaning', title: 'Deep Cleaning', description: 'A thorough cleaning of your entire home, top to bottom.', icon: DeepCleanIcon, price: '' },
    { id: 'carpet-cleaning', title: 'Carpet Cleaning', description: 'Professional steam cleaning for your carpets.', icon: CarpetIcon, price: '' },
    { id: 'kitchen-cleaning', title: 'Kitchen Cleaning', description: 'We sanitize all surfaces and clean appliances.', icon: KitchenIcon, price: '' },
    { id: 'bathroom-cleaning', title: 'Bathroom Cleaning', description: 'A complete disinfection and cleaning of bathrooms.', icon: BathroomIcon, price: '$100' },
    { id: 'window-cleaning', title: 'Window Cleaning', description: 'Streak-free cleaning for all interior and exterior windows.', icon: WindowIcon, price: '$150' },
    { id: 'office-cleaning', title: 'Office Cleaning', description: 'Customized cleaning plans for commercial spaces.', icon: OfficeIcon, price: 'Contact for Quote' },
];

const House_Cleaner: Cleaner = {
    name: "Geidy Cabrera", role: "Founder & Head Cleaner", bio: "With over 15 years of experience, Geidy founded SparkleClean with a passion for creating pristine and healthy living spaces.", imageUrl: "https://i.ibb.co/Vt9rQy7/cleaner.png", contact: "+14752080329",
};

// --- 6. LAYOUT & HELPER COMPONENTS ---

const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
};

const PageWrapper: React.FC<{ children: ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 animate-fadeIn ${className}`}>
        {children}
    </div>
);

const AppLayout: React.FC = () => (
    <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow"><Outlet /></main>
        <Footer />
    </div>
);

const Header = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isAdmin, logout } = useAuth();

    const navLinks = [
        { path: '/', name: 'Home' },
        { path: '/services', name: 'Services' },
        { path: '/about', name: 'About' },
        { path: '/contact', name: 'Contact' },
        { path: '/status', name: 'Check Status' },
    ];

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/');
    };

    useEffect(() => { setIsOpen(false); }, [location]);

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <Link to="/" className="flex items-center text-2xl font-bold text-sky-600">
                        <SparkleIcon className="h-8 w-8 text-sky-500 mr-2" />
                        SparkleClean
                    </Link>
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map(link => (
                            <NavLink key={link.name} to={link.path} className={({ isActive }) =>
                                `text-gray-600 hover:text-sky-600 transition duration-300 ${isActive ? 'text-sky-600 font-semibold' : ''}`
                            }>{link.name}</NavLink>
                        ))}
                        {isAdmin ? (
                            <>
                                <NavLink to="/admin/bookings" className={({ isActive }) => `text-gray-600 hover:text-sky-600 transition duration-300 ${isActive ? 'text-sky-600 font-semibold' : ''}`}>Dashboard</NavLink>
                                <NavLink to="/admin/settings" className={({ isActive }) => `text-gray-600 hover:text-sky-600 transition duration-300 ${isActive ? 'text-sky-600 font-semibold' : ''}`}>Settings</NavLink>
                                <button onClick={handleLogout} className="bg-red-500 text-white px-5 py-2 rounded-full hover:bg-red-600 transition duration-300 shadow-sm">Logout</button>
                            </>
                        ) : (
                            <Link to="/booking" className="bg-sky-500 text-white px-5 py-2 rounded-full hover:bg-sky-600 transition duration-300 shadow-sm">Book Now</Link>
                        )}
                    </div>
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-sky-600 focus:outline-none">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
                            </svg>
                        </button>
                    </div>
                </div>
                {isOpen && (
                    <div className="md:hidden pb-4 flex flex-col items-start space-y-2">
                        {navLinks.map(link => (
                            <NavLink key={link.name} to={link.path} className={({ isActive }) =>
                                `block w-full text-left px-2 py-1 text-gray-600 hover:text-sky-600 transition duration-300 ${isActive ? 'text-sky-600 font-semibold' : ''}`
                            }>{link.name}</NavLink>
                        ))}
                        {isAdmin ? (
                            <>
                                <NavLink to="/admin/bookings" className={({ isActive }) => `block w-full text-left px-2 py-1 text-gray-600 hover:text-sky-600 transition duration-300 ${isActive ? 'text-sky-600 font-semibold' : ''}`}>Dashboard</NavLink>
                                <NavLink to="/admin/settings" className={({ isActive }) => `block w-full text-left px-2 py-1 text-gray-600 hover:text-sky-600 transition duration-300 ${isActive ? 'text-sky-600 font-semibold' : ''}`}>Settings</NavLink>
                                <button onClick={handleLogout} className="mt-2 w-full text-center bg-red-500 text-white px-5 py-2 rounded-full hover:bg-red-600 transition duration-300 shadow-sm">Logout</button>
                            </>
                        ) : (
                            <Link to="/booking" className="mt-2 w-full text-center bg-sky-500 text-white px-5 py-2 rounded-full hover:bg-sky-600 transition duration-300 shadow-sm">Book Now</Link>
                        )}
                    </div>
                )}
            </nav>
        </header>
    );
};

const Footer = () => (
    <footer className="bg-gray-800 text-white">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
            <p>&copy; {new Date().getFullYear()} SparkleClean. All Rights Reserved.</p>
        </div>
    </footer>
);


// --- 7. PAGE COMPONENTS ---
const HomePage = () => {
    const navigate = useNavigate();
    return (
        <div>
            <div className="bg-sky-100 text-center py-20 md:py-32">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-800">Pristine Clean for Sparkling Home</h1>
                <p className="text-lg md:text-xl text-gray-600 mt-4 max-w-2xl mx-auto">Reliable, professional, and thorough cleaning services tailored to your needs.</p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button onClick={() => navigate('/booking')} className="bg-sky-500 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-sky-600 transition duration-300 shadow-lg transform hover:scale-105">
                        Book a Cleaning
                    </button>
                    <button onClick={() => navigate('/status')} className="bg-white text-sky-600 border border-sky-500 px-8 py-3 rounded-full text-lg font-semibold hover:bg-sky-50 transition duration-300 shadow-lg transform hover:scale-105">
                        Check Booking Status
                    </button>
                </div>
            </div>
            <PageWrapper>
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Services</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {SERVICES_DATA.slice(0, 6).map(service => (
                        <div key={service.id} className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 text-center">
                            <div className="flex justify-center items-center mb-4 text-sky-500"><service.icon className="h-12 w-12" /></div>
                            <h3 className="text-xl font-bold mb-2 text-gray-800">{service.title}</h3>
                            <p className="text-gray-600">{service.description.substring(0, 80)}...</p>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-12"><Link to="/services" className="text-sky-600 font-semibold hover:underline">View All Services &rarr;</Link></div>
            </PageWrapper>
        </div>
    );
};

const AboutPage = () => (
    <PageWrapper>
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">About SparkleClean</h1>
        <div className="text-center max-w-3xl mx-auto text-gray-600 text-lg mb-16">
            <p>Founded on the principle that a clean home is a happy home, SparkleClean has been dedicated to providing top-tier cleaning services. Our mission is to create pristine environments that allow our clients to focus on what matters most.</p>
        </div>
        <div className="max-w-sm mx-auto bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
            <img src={House_Cleaner.imageUrl} alt={House_Cleaner.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-sky-100" />
            <h3 className="text-xl font-semibold text-gray-800">{House_Cleaner.name}</h3>
            <p className="text-sky-600 font-medium mb-2">{House_Cleaner.role}</p>
            <p className="text-gray-600 text-sm">{House_Cleaner.bio}</p>
            <p className="mt-3 text-gray-700">📞 {House_Cleaner.contact}</p>
        </div>
    </PageWrapper>
);

const ServicesPage = () => {
    const navigate = useNavigate();
    return (
        <PageWrapper>
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">Our Cleaning Services</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {SERVICES_DATA.map(service => (
                    <div key={service.id} className="bg-white p-8 rounded-lg shadow-md flex flex-col">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-sky-100 rounded-full mr-4 text-sky-500"><service.icon className="h-8 w-8" /></div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800">{service.title}</h3>
                                {/* <p className="text-lg font-semibold text-sky-600">{service.price}</p> */}
                            </div>
                        </div>
                        <p className="text-gray-600 flex-grow mb-6">{service.description}</p>
                        <button onClick={() => navigate(`/booking?service=${service.id}`)} className="mt-auto bg-sky-500 text-white px-6 py-2 rounded-full hover:bg-sky-600 transition duration-300 self-start">
                            Book This Service
                        </button>
                    </div>
                ))}
            </div>
        </PageWrapper>
    );
};

const BookingPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', service: '', date: '', time: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { search } = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(search);
        const serviceId = params.get('service');
        if (serviceId) {
            setFormData(prev => ({ ...prev, service: serviceId }));
        }
    }, [search]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const newBooking = await api.createBooking(formData);
        setIsSubmitting(false);
        navigate(`/status?bookingNumber=${newBooking.bookingNumber}`);
    };

    return (
        <PageWrapper>
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">Book Your Cleaning</h1>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" name="name" id="name" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" onChange={handleChange} value={formData.name} />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" name="email" id="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" onChange={handleChange} value={formData.email} />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input type="tel" name="phone" id="phone" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" onChange={handleChange} value={formData.phone} />
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Full Address</label>
                        <input type="text" name="address" id="address" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" onChange={handleChange} value={formData.address} />
                    </div>
                    <div>
                        <label htmlFor="service" className="block text-sm font-medium text-gray-700">Select Service</label>
                        <select name="service" id="service" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" onChange={handleChange} value={formData.service}>
                            <option value="">-- Please choose a service --</option>
                            {SERVICES_DATA.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Preferred Date</label>
                            <input type="date" name="date" id="date" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" onChange={handleChange} value={formData.date} />
                        </div>
                        <div>
                            <label htmlFor="time" className="block text-sm font-medium text-gray-700">Preferred Time</label>
                            <input type="time" name="time" id="time" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500" onChange={handleChange} value={formData.time} />
                        </div>
                    </div>
                    <div>
                        <button type="submit" disabled={isSubmitting} className="w-full bg-sky-500 text-white py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium hover:bg-sky-600 disabled:bg-gray-400">
                            {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
                        </button>
                    </div>
                </form>
            </div>
        </PageWrapper>
    );
};

const ContactPage = () => (
    <PageWrapper>
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">Contact Us</h1>
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-xl text-center">
            <p className="text-gray-600">Have questions? We'd love to hear from you.</p>
            <p className="text-lg font-semibold text-sky-600 mt-4">{House_Cleaner.contact}</p>
        </div>
    </PageWrapper>
);

const StatusPage: React.FC = () => {
    const [bookingNumber, setBookingNumber] = useState('');
    const [booking, setBooking] = useState<Booking | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const bnFromUrl = params.get('bookingNumber');
        if (bnFromUrl) {
            setBookingNumber(bnFromUrl);
            handleCheckStatus(bnFromUrl);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    const handleCheckStatus = async (bn: string) => {
        if (!bn.trim()) {
            setError('Please enter a booking number.');
            return;
        }
        setIsLoading(true);
        setError('');
        setBooking(null);

        const result = await api.getBookingByNumber(bn);

        if (result) {
            setBooking(result);
            navigate(`/status?bookingNumber=${bn}`, { replace: true });
        } else {
            setError(`No booking found with number "${bn}".`);
        }
        setIsLoading(false);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        handleCheckStatus(bookingNumber);
    };

    const getStatusChip = (status: BookingStatus) => {
        const baseClasses = 'px-4 py-1.5 text-lg font-bold rounded-full inline-block';
        switch (status) {
            case 'Approved': return `${baseClasses} bg-green-100 text-green-800`;
            case 'Pending': return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'Rejected': return `${baseClasses} bg-red-100 text-red-800`;
            default: return '';
        }
    };

    return (
        <PageWrapper>
            <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Check Your Booking Status</h1>
            <p className="text-center text-gray-600 max-w-xl mx-auto mb-12">Enter the booking number you received after submitting your request to see the current status of your appointment.</p>

            <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-xl">
                <form onSubmit={handleSubmit} className="flex items-center space-x-4">
                    <input
                        type="text"
                        value={bookingNumber}
                        onChange={(e) => setBookingNumber(e.target.value)}
                        placeholder="Enter your booking number (e.g., SPK9A3B2)"
                        className="flex-grow block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                        aria-label="Booking Number"
                    />
                    <button type="submit" disabled={isLoading} className="bg-sky-500 text-white px-6 py-3 rounded-md hover:bg-sky-600 disabled:bg-gray-400">
                        {isLoading ? 'Checking...' : 'Check'}
                    </button>
                </form>
            </div>

            <div className="mt-12 max-w-2xl mx-auto">
                {error && <p className="text-center text-red-500 text-lg">{error}</p>}
                {booking && (
                    <div className="bg-white p-8 rounded-lg shadow-lg animate-fadeIn text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Booking Details</h2>
                        <p className="text-gray-600 mb-2">Booking Number:</p>
                        <p className="text-2xl font-mono font-bold text-sky-600 mb-6">{booking.bookingNumber}</p>
                        <div className={getStatusChip(booking.status)}>{booking.status}</div>
                        <div className="mt-6 text-left border-t pt-6 space-y-3">
                            <p><strong className="font-medium text-gray-800">Service:</strong> {SERVICES_DATA.find(s => s.id === booking.service)?.title}</p>
                            <p><strong className="font-medium text-gray-800">Date & Time:</strong> {new Date(booking.date).toLocaleDateString()} at {booking.time}</p>
                            <p><strong className="font-medium text-gray-800">Address:</strong> {booking.address}</p>
                        </div>
                    </div>
                )}
            </div>
        </PageWrapper>
    );
};


// const AdminBookingsPage = () => {
//     const [bookings, setBookings] = useState<Booking[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);

//     const loadBookings = async () => {
//         setIsLoading(true);
//         const allBookings = await api.getAllBookings();
//         setBookings(allBookings.sort((a, b) => b.id - a.id));
//         setIsLoading(false);
//     };

//     useEffect(() => { loadBookings(); }, []);

//     const handleUpdateStatus = async (bookingId: number, status: BookingStatus) => {
//         await api.updateBookingStatus(bookingId, status);
//         loadBookings();
//     };

//     const handleDeleteBooking = async (bookingId: number) => {
//         await api.deleteBooking(bookingId);
//         setShowDeleteModal(null);
//         loadBookings();
//     };

//     const getStatusChip = (status: BookingStatus) => {
//         const baseClasses = 'px-3 py-1 text-xs font-semibold rounded-full';
//         switch (status) {
//             case 'Approved': return `${baseClasses} bg-green-100 text-green-800`;
//             case 'Pending': return `${baseClasses} bg-yellow-100 text-yellow-800`;
//             case 'Rejected': return `${baseClasses} bg-red-100 text-red-800`;
//             default: return '';
//         }
//     };


//     return (
//         <PageWrapper>
//             <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">Admin Dashboard: All Bookings</h1>
//              {isLoading ? (
//                 <p className="text-center text-gray-600 text-lg">Loading bookings...</p>
//             ) : bookings.length > 0 ? (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//                     {bookings.map((booking) => (
//                         <div key={booking.id} className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
//                            <div>
//                                 <div className="flex justify-between items-start mb-2">
//                                     <h3 className="text-xl font-bold text-sky-600">{SERVICES_DATA.find(s => s.id === booking.service)?.title}</h3>
//                                     <span className={getStatusChip(booking.status)}>{booking.status}</span>
//                                 </div>
//                                 <p className="text-gray-500 text-sm font-mono mb-4">{booking.bookingNumber}</p>
//                                 <hr className="my-3" />
//                                 <div className="space-y-2 text-sm text-gray-700">
//                                     <p><strong className="font-medium text-gray-900">Customer:</strong> {booking.name}</p>
//                                     <p className="flex items-center">
//                                         <PhoneIcon className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
//                                         <a href={`tel:${booking.phone}`} className="text-sky-600 hover:underline">{booking.phone}</a>
//                                     </p>
//                                     <p><strong className="font-medium text-gray-900">Address:</strong> {booking.address}</p>
//                                 </div>
//                                 <hr className="my-3" />
//                                 <div className="space-y-2 text-sm text-gray-600">
//                                     <p><span className="font-medium">Date:</span> {new Date(booking.date).toLocaleDateString()}</p>
//                                     <p><span className="font-medium">Time:</span> {booking.time}</p>
//                                 </div>
//                            </div>
//                            <div className="flex flex-wrap items-center justify-end gap-2 mt-6">
//                                {booking.status === 'Pending' && (
//                                 <>
//                                   <button onClick={() => handleUpdateStatus(booking.id, 'Approved')} className="flex items-center px-3 py-2 text-sm text-white bg-green-500 rounded-md hover:bg-green-600"><CheckCircleIcon className="mr-1" />Approve</button>
//                                   <button onClick={() => handleUpdateStatus(booking.id, 'Rejected')} className="flex items-center px-3 py-2 text-sm text-white bg-orange-500 rounded-md hover:bg-orange-600"><XCircleIcon className="mr-1" />Reject</button>
//                                 </>
//                                )}
//                                <button onClick={() => setShowDeleteModal(booking.id)} className="flex items-center px-3 py-2 text-sm text-white bg-red-500 rounded-md hover:bg-red-600"><TrashIcon className="mr-1" />Delete</button>
//                            </div>
//                         </div>
//                     ))}
//                 </div>
//             ) : (
//                 <p className="text-center text-gray-600 text-lg">No bookings have been made yet.</p>
//             )}

//             {showDeleteModal !== null && (
//                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                     <div className="bg-white p-8 rounded-lg shadow-2xl max-w-sm w-full">
//                         <h2 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h2>
//                         <p className="text-gray-600 mb-6">Are you sure you want to delete this booking?</p>
//                         <div className="flex justify-end space-x-4">
//                             <button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300">Cancel</button>
//                             <button onClick={() => handleDeleteBooking(showDeleteModal)} className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700">Delete</button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </PageWrapper>
//     );
// };

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (login(password)) {
            navigate('/admin/bookings', { replace: true });
        } else {
            setError('Invalid password. Please try again.');
        }
    };

    return (
        <PageWrapper>
            <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-xl mt-16">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Admin Login</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            aria-describedby="password-error"
                        />
                    </div>
                    {error && <p id="password-error" className="text-red-500 text-sm">{error}</p>}
                    <div>
                        <button type="submit" className="w-full bg-sky-500 text-white py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium hover:bg-sky-600">
                            Login
                        </button>
                    </div>
                </form>
            </div>
        </PageWrapper>
    );
};

const AdminSettingsPage = () => {
    const { passwords, addPassword, deletePassword } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    const handleAddPassword = async (e: FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (await addPassword(newPassword)) {
            setMessage({ text: 'Password added successfully.', type: 'success' });
            setNewPassword('');
        } else {
            setMessage({ text: 'Password cannot be empty or already exist.', type: 'error' });
        }
    };

    const handleDeletePassword = async (password: string) => {
        setMessage(null);
        if (await deletePassword(password)) {
            setMessage({ text: 'Password removed successfully.', type: 'success' });
        } else {
            setMessage({ text: 'Cannot remove the last password.', type: 'error' });
        }
    };

    return (
        <PageWrapper>
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">Admin Settings</h1>
                <div className="bg-white p-8 rounded-lg shadow-xl">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Passwords</h2>

                    {message && (
                        <div className={`p-4 mb-6 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="space-y-4 mb-8">
                        {passwords.map(pw => (
                            <div key={pw.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
                                <span className="font-mono text-gray-700">{pw.password}</span>
                                <button
                                    onClick={() => handleDeletePassword(pw.id)}
                                    className="text-red-500 hover:text-red-700 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed"
                                    disabled={passwords.length <= 1}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}

                    </div>


                    <form onSubmit={handleAddPassword} className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-700">Add New Password</h3>
                        <div>
                            <label htmlFor="new-password" className="sr-only">New Password</label>
                            <input
                                id="new-password"
                                type="text"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                            />
                        </div>
                        <div>
                            <button type="submit" className="w-full bg-sky-500 text-white py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium hover:bg-sky-600">
                                Add Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </PageWrapper>
    );
};


const ProtectedRoute = () => {
    const { isAdmin } = useAuth();
    const location = useLocation();

    if (!isAdmin) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

// --- 8. MAIN APP COMPONENT ---

export default function App() {
    return (
        <AuthProvider>
            <ScrollToTop />
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/booking" element={<BookingPage />} />
                    <Route path="/status" element={<StatusPage />} />
                    <Route path="/admin/login" element={<AdminLoginPage />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="admin/bookings" element={<AdminBookingsPage />} />
                        <Route path="/admin/settings" element={<AdminSettingsPage />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </AuthProvider>
    );
}
