"use client";

import styles from './Header.module.scss';
import { useQuery } from '@apollo/client';
import { GET_USERS } from '@/graphql/queries/getUsers';

const Header = () => {
    // 예시: useQuery를 사용하여 데이터를 가져옵니다.
    // const { loading, error, data } = useQuery(GET_USERS);

    return (
        <header className={styles.header}>
            <div className={styles.logo}>MMTalk</div>
            <nav>
                <ul className={styles.navList}>
                    <li><a href="/">Home</a></li>
                    <li><a href="/profile">Profile</a></li>
                </ul>
            </nav>
        </header>
    )
}

export default Header;
