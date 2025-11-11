import AuthPage from "../AuthPage";

export default function AuthPageExample() {
  return (
    <AuthPage
      onLogin={(email, password) => console.log("Login:", email, password)}
      onSignup={(email, password, name, phone) => console.log("Signup:", { email, password, name, phone })}
    />
  );
}
