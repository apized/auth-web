import { Apis } from "../api/Config";
import apiFor from "../api/Api";
import { useMemo } from "react";

const SocialLogin = () => {

  useMemo(() => {
    const slug = window.location.pathname.match('/auth/login/([^/]+)$')![1];
    const queryParams = {} as any;
    window.location.search.substring(1)
      .split('&')
      .forEach((s) => {
        const split = s.split("=");
        queryParams[split[0]] = split[1]
      });
    apiFor(Apis.Auth.OauthLogin).get({
      id: `${slug}?code=${queryParams.code}`
    }).then(() => {
      window.close();
    }).catch(()=>{
      window.close();
    })
  }, []);

  return <></>;
};

export default SocialLogin;