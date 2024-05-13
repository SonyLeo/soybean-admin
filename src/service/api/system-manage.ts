import { request } from '../request';

/** get role list */
export function fetchGetRoleList(params?: Api.SystemManage.RoleSearchParams) {
  return request<Api.SystemManage.RoleList>({
    url: '/systemManage/getRoleList',
    method: 'get',
    params
  });
}

/**
 * get all roles
 *
 * these roles are all enabled
 */
export function fetchGetAllRoles() {
  return request<Api.SystemManage.AllRole[]>({
    url: '/systemManage/getAllRoles',
    method: 'get'
  });
}

/** get user list */
export function fetchGetUserList(params?: Api.SystemManage.UserSearchParams) {
  return request<Api.SystemManage.UserList>({
    url: '/system/user/list',
    method: 'get',
    params
  });
}

/**
 * 删除用户信息
 *
 * @param userId
 */
export const fetchDelUser = (userId: string | number | Array<string | number>) => {
  return request({
    url: `/system/user/${userId}`,
    method: 'delete'
  });
};

/**
 * 新增用户信息
 *
 * @param data
 */
export const fetchAddUser = (data: Api.SystemManage.UserForm) => {
  return request({
    url: '/system/user',
    method: 'post',
    data
  });
};

/**
 * 修改用户信息
 *
 * @param data
 */
export const fetchUpdateUser = (data: Api.SystemManage.UserForm) => {
  return request({
    url: '/system/user',
    method: 'put',
    data
  });
};

/**
 * 获取用户部门
 *
 * @param data
 */
export const fetchDeptTree = () => {
  return request({
    url: '/system/user/deptTree',
    method: 'get'
  });
};

/** 获取代码生成列表 */
export const fetchGenTableList = (data: Api.SystemManage.GenTableForm) => {
  return request<Api.SystemManage.GenTableList>({
    url: '/tool/gen/list',
    method: 'get',
    data
  });
};

/* 查询表详细信息 */
export const fetchGetGenTable = (tableId: string | number) => {
  return request<Api.SystemManage.GenTableInfo>({
    url: `/tool/gen/${tableId}`,
    method: 'get'
  });
};

/** 预览代码生成信息 */
export const fetchGenCode = (tableId: string | number) => {
  return request<Record<string, string>>({
    url: `/tool/gen/preview/${tableId}`,
    method: 'get'
  });
};

/** get menu list */
export function fetchGetMenuList() {
  return request<Api.SystemManage.MenuList>({
    url: '/systemManage/getMenuList/v2',
    method: 'get'
  });
}

/** get all pages */
export function fetchGetAllPages() {
  return request<string[]>({
    url: '/systemManage/getAllPages',
    method: 'get'
  });
}

/** get menu tree */
export function fetchGetMenuTree() {
  return request<Api.SystemManage.MenuTree[]>({
    url: '/systemManage/getMenuTree',
    method: 'get'
  });
}
