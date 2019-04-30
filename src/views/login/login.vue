<template>
    <div class='login'>
        <el-card class="box-card">
            <el-form :model="form" status-icon label-width="50px" label-position="left" size="medium" @submit.native.prevent>
                <div class="title">登&nbsp;&nbsp;&nbsp;&nbsp;录</div>
                <el-form-item label="账户">
                    <el-input v-model="form.account" placeholder="请填写账户" clearable></el-input>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="form.pwd" placeholder="请填写密码" show-password clearable></el-input>
                </el-form-item>
                <el-button class="btn" type="primary" round :loading="loading" @keyup.enter.native="verify" @click="verify" native-type="submit">提交</el-button>
            </el-form>
        </el-card>
    </div>
</template>

<script>
// import {setItem as setCookie, getItem as getCookie} from '@/project/koi/util/cookie'
// const accountCookieKey = 'train_account';
export default {
    data() {
        return {
            form: {
                account: '', // getCookie(accountCookieKey) || 
                pwd: '',
                refid: ''
            },
            loading: false
        }
    },
    methods: {
        verify() {
            if (this.form.account === '') {
                this.$message.error('请填写账号');
                return;
            }
            if (this.form.pwd === '') {
                this.$message.error('请填写密码');
                return;
            }
            this.submit();
        },
        submit() {
            // let form = {
            //     userName: this.form.account,
            //     password: this.form.pwd
            // };
            this.$router.push('/index');
            // this.$model.demo.login(
            //     form,
            //     (res) => {
            //         if (res.data.success) {
            //             setCookie(accountCookieKey, form.userName, 99, '/', location.hostname);
            //             setCookie('token', res.data.token, 0.5, '/', location.hostname);
            //             this.$unicom('user_login');
            //             this.$router.push('/index');
            //         } else {
            //             this.$message.error(res.err || '登录失败');
            //         }
            //     }
            // );
        }
    }
}
</script>

<style lang="less" scoped>
.login{
    display: flex;
    justify-content: center;
    align-items: center;
    .box-card {
        margin-top: 80px;
        width: 350px;
    }
    .el-form {
        padding: 0 15px;
    }
    .title {
        padding: 15px 0 20px;
        text-align: center;
        font-size: 28px;
        font-weight: 400;
    }
    .box {
        margin-top: 15px;
    }
    .btn {
        margin-top: 10px;
        margin-bottom: 15px;
        width: 100%;
    }
    .select {
        width: 100%;
    }
}
</style>
