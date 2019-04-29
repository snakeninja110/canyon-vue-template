<template>
    <div id="app" class="not-print" v-if="ready">
        <!-- <el-aside width="200px">Aside</el-aside> -->
        <el-container>
            <el-header class="header" v-show="!clearMode">
                <el-row class="main">
                    <el-col :span="4"><div class="logo">PC模板</div></el-col>
                    <el-col :span="16">
                        <el-menu
                                :default-active="activeMenuIndex"
                                class="menu-main"
                                mode="horizontal"
                                @select="menuClick"
                                background-color="#001520"
                                text-color="#fff"
                                active-text-color="#ffd04b">
                            <el-menu-item index="0">主页</el-menu-item>
                            <el-menu-item index="1">订单查询</el-menu-item>
                        </el-menu>
                    </el-col>
                    <el-col :span="4" class="user-info">
                        <span class="username">{{username}}</span>
                        &nbsp;
                        <el-button type="text" class="logout" @click="logout">退出</el-button>
                    </el-col>
                </el-row>
            </el-header>
            <el-main>
                <div class="main">
                    <keep-alive>
                        <router-view v-if="$route.meta.keepAlive"/>
                    </keep-alive>
                    <router-view v-if="!$route.meta.keepAlive" />
                </div>

            </el-main>
            <!-- <el-footer class="footer" v-if="!isLogin"></el-footer> -->
        </el-container>
    </div>
</template>

<script>
import {removeItem as removeCookie} from '@/project/koi/util/cookie'

export default {
    name: "App",
    data() {
        return {
            ready: false,
            activeMenuIndex: '-1',
            menus: [
                {
                    title: '主页',
                    path: '/index',
                    category: 'index'
                },
                {
                    title: '订单查询',
                    path: '/orderlist',
                    category: 'order'
                }
            ],
            username: this.$model.env.agentAcc,
            // 不展示header footer
            clearMode: true
        };
    },
    unicom: {
        user_login() {
            this.username = this.$model.env.agentAcc;
        }
    },
    watch: {
        '$route'(to) {
            let meta = to.meta || {};
            this.clearMode = !!meta.clear;
            this.activeMenuIndex = '-1';
            this.menus.forEach((menu, index) => {
                if (meta.menu === menu.category) {
                    this.activeMenuIndex = index.toString();
                }
            });
        }
    },
    methods: {
        logout() {
            let domain = location.hostname;
            removeCookie('token', '/', domain);
            this.$router.push('/login');
        },
        menuClick(index) {
            this.$router.push(this.menus[index].path);
        }
    },
    mounted() {
        setTimeout(() => {
            this.ready = true;
        });
    }
};
</script>

<style lang="less">
// @import "./assets/styles/common.less";
html, body{
    padding: 0;
    margin: 0;
    height: 100%;
    overflow:hidden;
}

body {
    font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","微软雅黑",Arial,sans-serif;
    // user-select: none;
    /*background-color: #eef1f4 !important;*/
    background-color: #eef0f3 !important;
}
#app {
    height: 100%;
    z-index: 1;
}
.header {
    line-height: 60px;
    background-color: #001524;
    .main {
        padding: 0 20px;
        .menu-main {
            border: none;
        }

        .logo {
            font-size: 18px;
            color: #fff;
        }

        .user-info {
            text-align: right;

            .username {
                color: #fff;
            }

            .logout {
                font-weight: 400;
            }
        }
    }
}
.el-footer {
    background-color: #001524;
    color: #333;
    text-align: center;
    height: 40px !important;
    line-height: 40px;
}

.el-aside {
    background-color: #D3DCE6;
    color: #333;
    text-align: center;
    line-height: 200px;
}

.el-main {
    position: relative;
    color: #333;
}

.el-container {
    height: 100%;
}

.index {
    color: #333333;
    height: 100%;
}

.main {
    margin: 0 auto;
    width: 1220px;
    .left-title {
        padding: 10px;
        margin-bottom: 10px;
        text-align: left;
        color: #17233d;
        font-size: 18px;
        font-weight: 500;
        border-bottom: 1px dashed #e4e4e4;
    }
}
.footer {
    background-color: transparent;
}

.el-card__header {
    color: #4499FE;
}
.center, .align-center {
    text-align: center;
}

@media print {
    .not-print {
        opacity: 0
    }
    .print {
        width: 270px;
    }
}
</style>
