import { useState } from 'react';
import userImg from '../../../assets/images/profile/user-1.jpg';
import supportImg from '../../../assets/images/dashboard/customer-support-img.png';
import { useAuth } from 'src/context/AuthContext';
import { X } from 'lucide-react';

const WELCOME_KEY = 'welcome-shown';

const ProfileWelcome = () => {
  const { user } = useAuth();
  const [visible, setVisible] = useState(() => !sessionStorage.getItem(WELCOME_KEY));

  const dismiss = () => {
    sessionStorage.setItem(WELCOME_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="relative flex items-center justify-between bg-lightsecondary rounded-lg p-6">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
        title="Cerrar"
      >
        <X className="size-4" />
      </button>

      <div className="flex items-center gap-3">
        <div>
          <img src={userImg} alt="user-img" width={50} height={50} className="rounded-full" />
        </div>
        <div className="flex flex-col gap-0.5">
          <h5 className="card-title">Bienvenido de nuevo! {user?.nombre?.split(' ')[0] || 'Usuario'} 👋</h5>
          <p className="text-muted-foreground">Revisa tus reportes</p>
        </div>
      </div>

      {/* Support Image */}
      <div className="hidden sm:block absolute right-8 bottom-0">
        <img src={supportImg} alt="support-img" width={145} height={95} />
      </div>
    </div>
  );
};

export default ProfileWelcome;
