import { useApiGet } from "../api/ApiHooks";
import { Apis } from "../api/Config";

const SocialLogin = () => {
  const slug = window.location.pathname.match('/auth/login/([^/]+)$')![1];
  const queryParams = {} as any;
  window.location.search.substring(1)
    .split('&')
    .forEach((s) => {
      const split = s.split("=");
      queryParams[split[0]] = split[1]
    });
  const { loading } = useApiGet(Apis.Auth.OauthLogin, {}, {
    id: `${slug}?code=${queryParams.code}&redirect=${encodeURIComponent(window.location.origin + window.location.pathname)}`
  });
  if (queryParams.code && !loading) {
    window.close();
  }
  return <></>;
};

export default SocialLogin;