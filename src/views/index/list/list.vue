<template>
    <div class='list'>
        <div class="title">列表</div>
        <el-table class="table" :data="tableData" highlight-current-row border stripe empty-text="没有找到符合条件的数据">
            <el-table-column class-name="row-cell" prop="id" label="id"></el-table-column>
            <el-table-column class-name="row-cell" prop="name" label="名称"></el-table-column>
            <el-table-column class-name="row-cell" prop="desc" label="描述"></el-table-column>
            <el-table-column class-name="row-cell" prop="price" label="单价"></el-table-column>
            <el-table-column class-name="row-cell" prop="arriveTime" label="到货时间"></el-table-column>
            <el-table-column class-name="row-cell" prop="count" label="总量"></el-table-column>
            <el-table-column class-name="row-cell step-cell" label="分类">
                <template slot-scope="scope">
                    <div class="mini-cell" v-for="(type, key) in scope.row.types" :key="key">{{Mapping[type.type]}}</div>
                </template>
            </el-table-column>
            <el-table-column class-name="row-cell" label="操作">
                <template slot-scope="scope">
                    <el-button type="primary" size="medium" plain @click="goBook(scope.row)">预订</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
export default {
    data() {
        return {
            Mapping: {
                '0': '大',
                '1': '小'
            },
            tableData: []
        }
    },
    unicom: {
        'list'(sender, data) {
            this.tableData = data;
        }
    },
    methods: {
        goBook(row) {
            this.$router.push({
                path: '/book',
                query: {data: JSON.stringify(row)}
            });
        }
    }
}
</script>

<style lang="less">
// @import '../../assets/styles/funs.less';
.list {
    .title {
        font-size: 22px;
        margin: 55px 0 20px;
    }
    .table {
        width: 100%;
        th {
            padding: 10px 0;
        }
        td {
            padding: 0;
        }
        .row-cell {
            text-align: center;
        }
        .step-cell {
            padding: 0;
            .cell {
                display: flex;
                flex-direction: column;
                // justify-content: center;
                // align-items: center;
                align-content: space-around;
                line-height: 36px;
                .mini-cell {
                    position: relative;
                    width: 100%;
                    height: 40px;
                    line-height: 40px;
                }
                .mini-cell + .mini-cell {
                    &:before {
                        position: absolute;
                        left: -10px;
                        right: -10px;
                        top: 0;
                        border-top: 1px solid #EBEEF5;
                        content: '';
                    }
                }
            }
        }
    }
}
</style>
