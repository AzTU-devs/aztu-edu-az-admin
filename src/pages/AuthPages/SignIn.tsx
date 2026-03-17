import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Daxil ol | AZTU İdarəetmə Paneli"
        description="Azərbaycan Texniki Universiteti rəsmi saytının idarəetmə panelinə daxil olun"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
