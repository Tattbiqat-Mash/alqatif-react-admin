/**
 * Every API path, relative to NEXT_PUBLIC_API_URL. Source: alqhat2022-Admin.postman_collection.json
 * (see rules/api-endpoints.md). Never hardcode a path elsewhere.
 */
type Id = string | number

export const endpoints = {
  auth: {
    login: "/admin/admins/login",
    changeMyPassword: "/admin/admins/changeMyPassword",
  },
  dashboard: {
    home: "/admin/settings/adminHome",
  },
  posts: {
    list: "/admin/posts/list",
    details: (id: Id) => `/admin/posts/getDetails/${id}`,
    add: "/admin/posts/add",
    edit: "/admin/posts/edit",
    delete: (id: Id) => `/admin/posts/delete/${id}`,
    changeActive: (id: Id, active: number) => `/admin/posts/changeActive/${id}/${active}`,
    changeFixed: (id: Id) => `/admin/posts/changeFixed/${id}`,
    authorNames: "/admin/posts/listAutherNames",
    banners: (categoryId: Id) => `/admin/posts/getBanners/${categoryId}`,
    khatmat: (postId: Id) => `/admin/posts/getKhtmat/${postId}`,
    claimEditor: "/admin/posts/changePostEditor",
    freeEditor: "/admin/posts/freePostEditor",
    sendNotification: (id: Id) => `/admin/posts/sendPostNotification/${id}`,
    uploadImage: "/admin/posts/uploadImage",
    uploadImages: "/admin/posts/uploadMultipleImages",
    images: (page: number) => `/admin/posts/listImages/${page}`,
  },
  categories: {
    list: "/admin/categories/list",
    details: (id: Id) => `/admin/categories/getDetails/${id}`,
  },
  comments: {
    list: "/admin/comments/list",
    details: (id: Id) => `/admin/comments/getDetails/${id}`,
    edit: "/admin/comments/edit",
    changeActive: (id: Id) => `/admin/comments/changeActive/${id}`,
    delete: (id: Id) => `/admin/comments/delete/${id}`,
  },
  ads: {
    list: "/admin/ads/list",
    details: (id: Id) => `/admin/ads/getDetails/${id}`,
    add: "/admin/ads/add",
    edit: "/admin/ads/edit",
    changeActive: (id: Id) => `/admin/ads/changeActive/${id}`,
    delete: (id: Id) => `/admin/ads/delete/${id}`,
    uploadImage: "/admin/ads/uploadImage",
  },
  editors: {
    list: "/admin/admins/list",
    details: (id: Id) => `/admin/admins/getDetails/${id}`,
    add: "/admin/admins/add",
    edit: "/admin/admins/edit",
    changeActive: (id: Id) => `/admin/admins/changeActive/${id}`,
    delete: (id: Id) => `/admin/admins/delete/${id}`,
  },
  notifications: {
    send: "/admin/settings/sendNotification",
  },
  surveys: {
    list: "/admin/surveys/list",
    details: (id: Id) => `/admin/surveys/getDetails/${id}`,
    add: "/admin/surveys/add",
    edit: "/admin/surveys/edit",
    addAnswer: "/admin/surveys/addQuestion",
    editAnswer: "/admin/surveys/editQuestion",
    deleteAnswer: (id: Id) => `/admin/surveys/deleteQuestion/${id}`,
    changeActive: (id: Id) => `/admin/surveys/changeActive/${id}`,
    delete: (id: Id) => `/admin/surveys/delete/${id}`,
  },
  settings: {
    details: "/admin/settings/getDetails",
    edit: "/admin/settings/edit",
  },
} as const
