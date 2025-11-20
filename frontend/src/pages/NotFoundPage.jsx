import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pepper-orange to-pepper-yellow flex items-center justify-center px-4">
      <div className="text-center text-white">
        <h1 className="font-cherry-bomb text-9xl md:text-[12rem] mb-4 animate-bounce">
          404
        </h1>
        <h2 className="font-gabarito font-bold text-3xl md:text-5xl mb-4">
          Oops! Page Not Found
        </h2>
        <p className="font-inter text-lg md:text-xl mb-8 opacity-90 max-w-md mx-auto">
          The page you're looking for seems to have wandered off the menu.
          Let's get you back on track!
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-white text-pepper-orange px-8 py-4 rounded-lg font-gabarito font-bold text-lg hover:bg-pepper-light transition-colors duration-200 shadow-lg"
        >
          <FontAwesomeIcon icon={faHome} />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
