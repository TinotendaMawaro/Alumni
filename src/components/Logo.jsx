const Logo = ({ className = 'w-full h-full' }) => {
  return (
    <img 
      src="/logo.jpeg" 
      alt="School of Hospitality and Tourism" 
      className={className}
    />
  );
};

export default Logo;
