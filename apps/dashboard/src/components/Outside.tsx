import { SignIn } from '@clerk/clerk-react';

const Outside = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-50">
    <SignIn signUpUrl={undefined} />
  </div>
);

export default Outside;
