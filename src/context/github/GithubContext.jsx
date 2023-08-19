import { createContext, useReducer } from "react";
import githubReducer from "./GithubReducer";

const GithubContetxt = createContext();

const GITHUB_URL = process.env.REACT_APP_GITHUB_URL;
const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN;

export function GithubProvider({ children }) {
  const initialState = {
    users: [],
    user: {},
    repos: [],
    loading: false,
  };
  const [state, dispatch] = useReducer(githubReducer, initialState);

  //Get search results
  async function searchUsers(text) {
    setLoading();

    const params = new URLSearchParams({
      q: text,
    });
    const response = await fetch(`${GITHUB_URL}/search/users?${params}`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });
    const { items } = await response.json();

    dispatch({
      type: "GET_USERS",
      payload: items,
    });
  }
  //Get single user
  async function getUser(login) {
    setLoading();

    const response = await fetch(`${GITHUB_URL}/users/${login}`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });

    if (response.status === 404) {
      window.location = "/notfound";
    } else {
      const data = await response.json();

      dispatch({
        type: "GET_USER",
        payload: data,
      });
    }
  }
  //Get user repos
  async function getUserRepos(login) {
    setLoading();
    const params = new URLSearchParams({
      sort: "created",
      per_page: 10,
    });

    const response = await fetch(
      `${GITHUB_URL}/users/${login}/repos?${params}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
        },
      },
    );
    const data = await response.json();

    dispatch({
      type: "GET_REPOS",
      payload: data,
    });
  }
  //Set loading
  function setLoading() {
    dispatch({
      type: "SET_LOADING",
    });
  }
  //Clear users
  function clearUsers() {
    dispatch({
      type: "CLEAR_USERS",
      payload: [],
    });
  }

  return (
    <GithubContetxt.Provider
      value={{
        users: state.users,
        user: state.user,
        loading: state.loading,
        repos: state.repos,
        searchUsers,
        clearUsers,
        getUser,
        getUserRepos,
      }}
    >
      {children}
    </GithubContetxt.Provider>
  );
}
export default GithubContetxt;
