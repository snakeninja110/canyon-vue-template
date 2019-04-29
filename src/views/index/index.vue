<template>
    <div>
        <el-card class="box-card">
            <div slot="header" class="clearfix">
                <span>主页</span>
            </div>
            <div>
                <Search />
                <list />
            </div>
        </el-card>
        <router-view></router-view>
    </div>
</template>

<script>
import Search from '@/components/Search';
import list from './list/list';

export default {
    data() {
        return {}
    },
    components: {
        Search,
        list
    }
}
</script>

<style lang="less">

.line-box {
    // border-bottom: 1px solid #EBEEF5;
    border-radius: 5px;
    // box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);
}

.line-box + .line-box {
    margin-top: 15px;
}

.padding10 {
    padding: 10px;
}

.padding5 {
    padding: 5px;
}
</style>

