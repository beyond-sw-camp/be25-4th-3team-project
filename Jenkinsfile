pipeline {
    agent any

    options {
        // 각 빌드는 중복 실행되지 않도록 한다.
        disableConcurrentBuilds()
    }

    environment {
        // Docker 이미지 이름과 K8s 매니페스트 위치를 공통 변수로 관리한다.
        BACK_IMAGE = 'leetrue801/autosource-back'
        FRONT_IMAGE = 'leetrue801/autosource-vue'
        K8S_DIR = 'k8s'
        K8S_NAMESPACE = 'default'
    }

    stages {
        stage('Checkout') {
            steps {
                // 현재 브랜치의 소스 코드를 가져온다.
                checkout scm
            }
        }

        stage('Build Images') {
            steps {
                // 백엔드와 프론트엔드 이미지를 각각 만든다.
                sh """
                    docker build -t ${BACK_IMAGE}:${BUILD_NUMBER} ./back
                    docker build \
                      --build-arg VITE_API_BASE_URL=/api \
                      --build-arg VITE_OAUTH_BASE_URL= \
                      -t ${FRONT_IMAGE}:${BUILD_NUMBER} ./front
                """
            }
        }

        stage('Push Images') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKERHUB_USER',
                    passwordVariable: 'DOCKERHUB_PASS'
                )]) {
                    // 빌드한 이미지를 Docker Hub에 올린다.
                    sh """
                        echo "${DOCKERHUB_PASS}" | docker login -u "${DOCKERHUB_USER}" --password-stdin
                        docker push ${BACK_IMAGE}:${BUILD_NUMBER}
                        docker push ${FRONT_IMAGE}:${BUILD_NUMBER}
                        docker logout
                    """
                }
            }
        }

        stage('Apply Secret') {
            steps {
                withCredentials([
                    string(credentialsId: 'mariadb-root-password', variable: 'MARIADB_ROOT_PASSWORD'),
                    string(credentialsId: 'mariadb-app-password', variable: 'MARIADB_PASSWORD')
                ]) {
                    // Jenkins Credentials에 있는 비밀값으로 MariaDB Secret을 생성한다.
                    sh """
                        kubectl create secret generic mariadb-secret \
                          --namespace ${K8S_NAMESPACE} \
                          --from-literal=MARIADB_ROOT_PASSWORD="${MARIADB_ROOT_PASSWORD}" \
                          --from-literal=MARIADB_PASSWORD="${MARIADB_PASSWORD}" \
                          --dry-run=client -o yaml | kubectl apply -f -
                    """
                }
            }
        }

        stage('Deploy to K8s') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG_FILE')]) {
                    // K8s에 공통 리소스와 디플로이먼트를 적용한 뒤 이미지 태그를 갱신한다.
                    sh """
                        mkdir -p ~/.kube
                        cp "${KUBECONFIG_FILE}" ~/.kube/config

                        kubectl apply -f ${K8S_DIR}/ConfigMap/global-config.yaml
                        kubectl apply -f ${K8S_DIR}/Volume/mariadb-pv.yaml
                        kubectl apply -f ${K8S_DIR}/Volume/mariadb-pvc.yaml
                        kubectl apply -f ${K8S_DIR}/MariaDB/mariadb-deployment.yaml
                        kubectl apply -f ${K8S_DIR}/MariaDB/mariadb-service.yaml
                        kubectl apply -f ${K8S_DIR}/Backend/backend-deployment.yaml
                        kubectl apply -f ${K8S_DIR}/Backend/backend-service.yaml
                        kubectl apply -f ${K8S_DIR}/Frontend/frontend-deployment.yaml
                        kubectl apply -f ${K8S_DIR}/Frontend/frontend-service.yaml
                        kubectl apply -f ${K8S_DIR}/ingress.yaml

                        kubectl set image deployment/autosource-api-deploy autosource-api=${BACK_IMAGE}:${BUILD_NUMBER}
                        kubectl set image deployment/autosource-vue-deploy myapp=${FRONT_IMAGE}:${BUILD_NUMBER}

                        kubectl rollout status deployment/autosource-api-deploy -n ${K8S_NAMESPACE}
                        kubectl rollout status deployment/autosource-vue-deploy -n ${K8S_NAMESPACE}
                        kubectl rollout status deployment/autosource-mariadb-deploy -n ${K8S_NAMESPACE}
                    """
                }
            }
        }
    }

    post {
        failure {
            echo 'Jenkins pipeline failed.'
        }
        success {
            echo 'Jenkins pipeline completed successfully.'
        }
    }
}
