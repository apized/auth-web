import { useApiGet } from "../api/ApiHooks";
import { Apis } from "../api/Config";
import apiFor from "../api/Api";
import { useEffect, useMemo } from "react";

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
    const api = apiFor(Apis.Auth.OauthLogin);
    api.get({
      id: `${slug}?code=${queryParams.code}&redirect=${encodeURIComponent(window.location.origin + window.location.pathname)}`
    }).then(() => {
      window.close()
    })
  }, []);

  return <></>;
};

export default SocialLogin;