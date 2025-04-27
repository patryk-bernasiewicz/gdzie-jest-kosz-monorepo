import { SignIn } from "@clerk/clerk-react";

const Outside = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <SignIn signUpUrl={undefined} />
  </div>
);

export default Outside;
