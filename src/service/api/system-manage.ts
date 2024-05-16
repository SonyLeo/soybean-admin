import FileSaver from 'file-saver';
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

/** 获取指定数据库的数据表 */
export const fetchDBTableList = (params: Api.SystemManage.DBTableForm) => {
  return request<Api.SystemManage.GenTableList>({
    url: `/tool/gen/db/list`,
    method: 'get',
    params
  });
};

/** 导入表结构 */
export const fetchImportGenTable = (params: Api.SystemManage.DBTableImport) => {
  return request({
    url: `/tool/gen/importTable`,
    method: 'post',
    params
  });
};

/** 自定义路径生成代码 */
export const fetchDownloadCode = (tableId: string | number) => {
  return request({
    url: `/tool/gen/genCode${tableId}`,
    method: 'get'
  });
};

/** 下载代码压缩包文件 */
export const fetchDownloadCodeZip = (tableId: string | number) => {
  request({
    url: `/tool/gen/batchGenCode?tableIdStr=${tableId}`,
    method: 'get',
    responseType: 'blob'
  }).then(res => {
    const { data } = res;
    if (data) {
      const blob = new Blob([data], { type: 'application/octet-stream' });
      FileSaver.saveAs(blob, 'soybean.zip');
    }
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
