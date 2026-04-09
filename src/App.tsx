/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Link, 
  useNavigate,
  useParams
} from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Hammer, 
  ShoppingBag, 
  MessageCircle, 
  User, 
  Plus, 
  Heart, 
  Search, 
  LogOut, 
  LogIn,
  Image as ImageIcon,
  Send,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { AuthProvider, useAuth } from './AuthContext';
import { 
  db, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  where,
  doc,
  getDoc,
  updateDoc,
  increment,
  handleFirestoreError,
  OperationType
} from './firebase';

// --- Components ---

const Navbar = () => {
  const { user, profile, signIn, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="bg-orange-500 p-2 rounded-lg">
              <Hammer className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-gray-900 font-sans tracking-tight">حِرفي</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            <Link to="/" className="text-gray-600 hover:text-orange-500 transition-colors">الرئيسية</Link>
            <Link to="/explore" className="text-gray-600 hover:text-orange-500 transition-colors">استكشف</Link>
            {user ? (
              <>
                <Link to="/messages" className="text-gray-600 hover:text-orange-500 transition-colors">الرسائل</Link>
                {profile?.role === 'craftsman' && (
                  <Link to="/add-work" className="bg-orange-500 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-orange-600 transition-all">
                    <Plus size={18} />
                    <span>أضف عمل</span>
                  </Link>
                )}
                <div className="flex items-center gap-4">
                  <Link to={`/profile/${user.uid}`} className="flex items-center gap-2">
                    <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border" referrerPolicy="no-referrer" />
                  </Link>
                  <button onClick={() => signOut()} className="text-gray-400 hover:text-red-500 transition-colors">
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              <button 
                onClick={() => signIn()} 
                className="bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                <LogIn size={18} />
                <span>تسجيل الدخول</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-2">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
              <Link to="/" onClick={() => setIsOpen(false)} className="p-3 text-gray-700 hover:bg-gray-50 rounded-lg">الرئيسية</Link>
              <Link to="/explore" onClick={() => setIsOpen(false)} className="p-3 text-gray-700 hover:bg-gray-50 rounded-lg">استكشف</Link>
              {user ? (
                <>
                  <Link to="/messages" onClick={() => setIsOpen(false)} className="p-3 text-gray-700 hover:bg-gray-50 rounded-lg">الرسائل</Link>
                  <Link to={`/profile/${user.uid}`} onClick={() => setIsOpen(false)} className="p-3 text-gray-700 hover:bg-gray-50 rounded-lg">الملف الشخصي</Link>
                  <button onClick={() => { signOut(); setIsOpen(false); }} className="p-3 text-red-500 text-right">تسجيل الخروج</button>
                </>
              ) : (
                <button onClick={() => { signIn(); setIsOpen(false); }} className="p-3 text-orange-500 font-bold text-right">تسجيل الدخول</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Pages ---

const Home = () => {
  return (
    <div className="space-y-16 py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 text-center space-y-8">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight"
        >
          اكتشف <span className="text-orange-500">إبداع</span> الحرفيين <br /> في مكان واحد
        </motion.h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          منصة تجمع بين المبدعين والباحثين عن التميز. تواصل مباشرة مع الحرفيين واطلب أعمالك المفضلة.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/explore" className="bg-orange-500 text-white px-8 py-4 rounded-full text-lg font-bold hover:scale-105 transition-transform">
            تصفح الأعمال
          </Link>
          <Link to="/register-craftsman" className="bg-white border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-50 transition-colors">
            انضم كحرفي
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['نجارة', 'خزف', 'خياطة', 'رسم'].map((cat, i) => (
            <motion.div 
              key={cat}
              whileHover={{ y: -5 }}
              className="bg-gray-50 p-8 rounded-3xl text-center cursor-pointer hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-200"
            >
              <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <ImageIcon className="text-orange-500" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{cat}</h3>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

const Explore = () => {
  const [works, setWorks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'works'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const worksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWorks(worksData);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'works'));

    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">استكشف الأعمال</h2>
          <p className="text-gray-500 text-lg">أحدث ما أبدعه الحرفيون العرب</p>
        </div>
        <div className="relative hidden md:block">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="ابحث عن عمل..." 
            className="bg-white border border-gray-200 rounded-full pr-12 pl-6 py-3 w-80 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-3xl"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {works.map((work) => (
            <motion.div 
              key={work.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all"
            >
              <div className="relative aspect-square overflow-hidden">
                <img 
                  src={work.imageUrl} 
                  alt={work.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <button className="absolute top-4 left-4 bg-white/80 backdrop-blur p-2 rounded-full hover:bg-white transition-colors">
                  <Heart size={20} className="text-gray-400 hover:text-red-500" />
                </button>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-gray-900">{work.title}</h3>
                  <span className="text-orange-600 font-bold">{work.price} ر.س</span>
                </div>
                <Link to={`/profile/${work.craftsmanId}`} className="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors">
                  <User size={16} />
                  <span className="text-sm">{work.craftsmanName}</span>
                </Link>
                <div className="pt-4 flex gap-2">
                  <Link 
                    to={`/chat/${work.craftsmanId}`}
                    className="flex-1 bg-gray-900 text-white text-center py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                  >
                    تواصل الآن
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const AddWork = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    price: '',
    category: 'نجارة'
  });

  if (!user || profile?.role !== 'craftsman') {
    return <div className="p-12 text-center">عذراً، يجب أن تكون حرفياً لإضافة أعمال.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'works'), {
        ...formData,
        price: Number(formData.price),
        craftsmanId: user.uid,
        craftsmanName: user.displayName,
        createdAt: serverTimestamp(),
        likesCount: 0
      });
      navigate('/explore');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'works');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
        <h2 className="text-3xl font-bold text-gray-900">أضف عملاً جديداً</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">عنوان العمل</label>
            <input 
              required
              type="text" 
              className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-orange-500"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">رابط الصورة</label>
            <input 
              required
              type="url" 
              placeholder="https://..."
              className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-orange-500"
              value={formData.imageUrl}
              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">السعر (ر.س)</label>
              <input 
                required
                type="number" 
                className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">التصنيف</label>
              <select 
                className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-orange-500"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option>نجارة</option>
                <option>خزف</option>
                <option>خياطة</option>
                <option>رسم</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">الوصف</label>
            <textarea 
              rows={4}
              className="w-full bg-gray-50 border-none rounded-2xl p-4 outline-none focus:ring-2 focus:ring-orange-500"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>
          <button 
            disabled={loading}
            className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'جاري النشر...' : 'نشر العمل'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Chat = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiver, setReceiver] = useState<any>(null);

  const chatId = [user?.uid, userId].sort().join('_');

  useEffect(() => {
    if (!userId) return;
    
    // Fetch receiver info
    getDoc(doc(db, 'users', userId)).then(snap => {
      if (snap.exists()) setReceiver(snap.data());
    });

    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `chats/${chatId}/messages`));

    return () => unsubscribe();
  }, [userId, chatId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        senderId: user.uid,
        receiverId: userId,
        text: newMessage,
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `chats/${chatId}/messages`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-120px)] flex flex-col">
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-50 flex items-center gap-4">
          <img src={receiver?.photoURL} alt="" className="w-10 h-10 rounded-full border" referrerPolicy="no-referrer" />
          <div>
            <h3 className="font-bold text-gray-900">{receiver?.displayName}</h3>
            <span className="text-xs text-green-500">متصل الآن</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] p-4 rounded-2xl ${
                msg.senderId === user?.uid 
                  ? 'bg-orange-500 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-sm'
              }`}>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-50 flex gap-4">
          <input 
            type="text" 
            placeholder="اكتب رسالتك هنا..." 
            className="flex-1 bg-gray-50 border-none rounded-2xl px-6 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
          />
          <button className="bg-orange-500 text-white p-3 rounded-2xl hover:bg-orange-600 transition-colors">
            <Send size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};

const Profile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [works, setWorks] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;
    getDoc(doc(db, 'users', userId)).then(snap => {
      if (snap.exists()) setProfile(snap.data());
    });

    const q = query(collection(db, 'works'), where('craftsmanId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setWorks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [userId]);

  if (!profile) return <div className="p-12 text-center">جاري التحميل...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 flex flex-col md:flex-row items-center gap-8">
        <img src={profile.photoURL} alt="" className="w-32 h-32 rounded-full border-4 border-orange-100" referrerPolicy="no-referrer" />
        <div className="flex-1 text-center md:text-right space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">{profile.displayName}</h2>
          <p className="text-gray-500">{profile.role === 'craftsman' ? 'حرفي مبدع' : 'مشتري'}</p>
          <p className="text-gray-600 max-w-xl">{profile.bio || 'لا يوجد نبذة شخصية حتى الآن.'}</p>
        </div>
        <div className="flex gap-4">
          <Link to={`/chat/${userId}`} className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-all">
            تواصل
          </Link>
        </div>
      </div>

      {profile.role === 'craftsman' && (
        <div className="space-y-8">
          <h3 className="text-2xl font-bold text-gray-900">أعمالي ({works.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {works.map(work => (
              <div key={work.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100">
                <img src={work.imageUrl} alt="" className="w-full aspect-square object-cover" referrerPolicy="no-referrer" />
                <div className="p-4">
                  <h4 className="font-bold text-lg">{work.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const RegisterCraftsman = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleUpgrade = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        role: 'craftsman'
      });
      navigate('/add-work');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-8">
      <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
        <Hammer className="text-orange-600" size={40} />
      </div>
      <h2 className="text-4xl font-bold text-gray-900">حول حسابك إلى حرفي</h2>
      <p className="text-gray-600 text-lg">
        ابدأ بنشر أعمالك، تواصل مع المشترين، وابنِ سمعتك في سوق الحرفيين.
      </p>
      <button 
        onClick={handleUpgrade}
        className="bg-orange-500 text-white px-12 py-4 rounded-full text-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
      >
        تفعيل حساب الحرفي
      </button>
    </div>
  );
};

// --- Main App ---

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#FAFAFA] font-sans" dir="rtl">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/add-work" element={<AddWork />} />
              <Route path="/chat/:userId" element={<Chat />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/register-craftsman" element={<RegisterCraftsman />} />
              <Route path="/messages" element={<div className="p-12 text-center">قريباً: قائمة المحادثات</div>} />
            </Routes>
          </main>
          
          {/* Footer */}
          <footer className="bg-white border-t border-gray-100 py-12 mt-24">
            <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
              <div className="flex justify-center items-center space-x-2 rtl:space-x-reverse opacity-50">
                <Hammer size={20} />
                <span className="font-bold">حِرفي</span>
              </div>
              <p className="text-gray-400 text-sm">© 2026 جميع الحقوق محفوظة لمنصة حِرفي</p>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
