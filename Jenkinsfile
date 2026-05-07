pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  # Jenkins에서 Docker 명령어를 실행하기 위한 컨테이너
  - name: docker
    image: docker:28.5.1-cli-alpine3.22
    command: ["cat"]
    tty: true
    volumeMounts:
    - name: docker-socket
      mountPath: /var/run/docker.sock
  # Jenkins에서 Git 명령어를 실행하기 위한 컨테이너
  - name: git
    image: alpine/git:latest
    command: ["cat"]
    tty: true
  volumes:
  - name: docker-socket
    hostPath:
      path: /var/run/docker.sock
      type: Socket
'''
        }
    }

    options {
        // 각 빌드는 중복 실행되지 않도록 한다.
        disableConcurrentBuilds()
    }

    environment {
        BACK_IMAGE = 'leetrue801/autosource-back'
        FRONT_IMAGE = 'leetrue801/autosource-vue'
        DOCKER_CREDENTIALS_ID = 'autosource'
        GIT_CREDENTIALS_ID = 'github-autosource-app'
        GIT_PUSH_URL = 'git@github.com:beyond-sw-camp/be25-4th-AVG176-project.git'
        K8S_APP_DIR = 'k8s/autosource'
        BACK_IMAGE_TAG = ''
        FRONT_IMAGE_TAG = ''
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Detect Changes') {
            steps {
                script {
                    def changedFilesText = sh(
                        script: '''
                            if git rev-parse HEAD~1 >/dev/null 2>&1; then
                              git diff --name-only HEAD~1 HEAD
                            else
                              git ls-files
                            fi
                        ''',
                        returnStdout: true
                    ).trim()

                    def changedFiles = changedFilesText ? changedFilesText.readLines() : []
                    // 변경된 파일 목록에서 back/ 또는 front/ 디렉토리의 변경 여부를 판단하여 환경 변수로 설정
                    env.BUILD_BACK = changedFiles.any { it.startsWith('back/') } ? 'true' : 'false'
                    env.BUILD_FRONT = changedFiles.any { it.startsWith('front/') } ? 'true' : 'false'

                    echo "BUILD_BACK: ${env.BUILD_BACK}"
                    echo "BUILD_FRONT: ${env.BUILD_FRONT}"

                    // 변경된 파일이 없거나 back/와 front/ 디렉토리 모두 변경되지 않은 경우, 빌드 및 GitOps 업데이트를 건너뛴다.
                    if (env.BUILD_BACK == 'false' && env.BUILD_FRONT == 'false') {
                        echo 'No back/front changes detected. Skipping image build and GitOps update.'
                    }
                }
            }
        }

        // Jenkins가 매니페스트 태그를 계산하기 전에 원격 main의 최신 상태를 먼저 반영한다.
        // 이렇게 해야 다른 빌드가 먼저 올린 이미지 태그 커밋을 기준으로 다음 태그를 계산할 수 있다.
        stage('Sync Latest Main') {
            when {
                expression {
                    return env.BUILD_BACK == 'true' || env.BUILD_FRONT == 'true'
                }
            }
            steps {
                container('git') {
                    withCredentials([sshUserPrivateKey(
                        credentialsId: 'github-autosource-app',
                        keyFileVariable: 'GIT_SSH_KEY'
                    )]) {
                        sh """
                            git config --global --add safe.directory "${WORKSPACE}"
                            git remote set-url origin ${GIT_PUSH_URL}
                            GIT_SSH_COMMAND="ssh -i ${GIT_SSH_KEY} -o StrictHostKeyChecking=no" git fetch origin main
                            git rebase FETCH_HEAD
                        """
                    }
                }
            }
        }

        // 백엔드와 프론트엔드가 서로 독립적인 이미지 태그 번호를 사용하도록 현재 매니페스트의 태그에서 각각 1씩 증가시킨다.
        stage('Resolve Image Tags') {
            when {
                expression {
                    return env.BUILD_BACK == 'true' || env.BUILD_FRONT == 'true'
                }
            }
            steps {
                script {
                    if (env.BUILD_BACK == 'true') {
                        def currentBackTag = sh(
                            script: "grep -E 'image: ${BACK_IMAGE}:' ${K8S_APP_DIR}/backend-deployment.yaml | head -n 1 | awk -F: '{print \$NF}' | tr -d ' \"'",
                            returnStdout: true
                        ).trim()
                        env.BACK_IMAGE_TAG = String.valueOf(currentBackTag.toInteger() + 1)
                    }

                    if (env.BUILD_FRONT == 'true') {
                        def currentFrontTag = sh(
                            script: "grep -E 'image: ${FRONT_IMAGE}:' ${K8S_APP_DIR}/frontend-deployment.yaml | head -n 1 | awk -F: '{print \$NF}' | tr -d ' \"'",
                            returnStdout: true
                        ).trim()
                        env.FRONT_IMAGE_TAG = String.valueOf(currentFrontTag.toInteger() + 1)
                    }

                    echo "BACK_IMAGE_TAG: ${env.BACK_IMAGE_TAG ?: 'unchanged'}"
                    echo "FRONT_IMAGE_TAG: ${env.FRONT_IMAGE_TAG ?: 'unchanged'}"
                }
            }
        }

        // 변경된 파일이 back/ 또는 front/ 디렉토리에 있는 경우에만 이미지 빌드 및 GitOps 업데이트를 수행한다.
        stage('Build & Push Images') {
            when {
                expression {
                    return env.BUILD_BACK == 'true' || env.BUILD_FRONT == 'true'
                }
            }
            steps {
                container('docker') {
                    withCredentials([usernamePassword(
                        credentialsId: DOCKER_CREDENTIALS_ID,
                        usernameVariable: 'DOCKERHUB_USER',
                        passwordVariable: 'DOCKERHUB_PASS'
                    )]) {
                        sh '''
                            echo "${DOCKERHUB_PASS}" | docker login -u "${DOCKERHUB_USER}" --password-stdin
                        '''
                    }

                    script {
                        // 변경된 파일이 back/ 디렉토리에 있는 경우 백엔드 이미지를 빌드하고 푸시한다.
                        if (env.BUILD_BACK == 'true') {
                            sh """
                                docker build --no-cache -t ${BACK_IMAGE}:${BACK_IMAGE_TAG} ./back
                                docker push ${BACK_IMAGE}:${BACK_IMAGE_TAG}
                            """
                        }

                        if (env.BUILD_FRONT == 'true') {
                            // 변경된 파일이 front/ 디렉토리에 있는 경우 프론트엔드 이미지를 빌드하고 푸시한다.
                            sh """
                                docker build --no-cache \
                                  --build-arg VITE_API_BASE_URL=/api \
                                  --build-arg VITE_OAUTH_BASE_URL= \
                                  -t ${FRONT_IMAGE}:${FRONT_IMAGE_TAG} ./front
                                docker push ${FRONT_IMAGE}:${FRONT_IMAGE_TAG}
                            """
                        }
                    }

                    sh 'docker logout'
                }
            }
        }


        // 변경된 파일이 back/ 또는 front/ 디렉토리에 있는 경우에만 ArgoCD 매니페스트를 업데이트한다.
        stage('Update ArgoCD Manifests') {
            when {
                expression {
                    return env.BUILD_BACK == 'true' || env.BUILD_FRONT == 'true'
                }
            }
            steps {
                container('git') {
                    script {
                        // 변경된 파일이 back/ 디렉토리에 있는 경우 백엔드 매니페스트의 이미지 태그를 업데이트한다.
                        // 대상 파일 : k8s/autosource/backend-deployment.yaml
                        if (env.BUILD_BACK == 'true') {
                            sh """
                                sed -i 's|image: ${BACK_IMAGE}:.*|image: ${BACK_IMAGE}:${BACK_IMAGE_TAG}|' ${K8S_APP_DIR}/backend-deployment.yaml
                            """
                        }

                        // 변경된 파일이 front/ 디렉토리에 있는 경우 프론트엔드 매니페스트의 이미지 태그를 업데이트한다.
                        // 대상 파일 : k8s/autosource/frontend-deployment.yaml
                        if (env.BUILD_FRONT == 'true') {
                            sh """
                                sed -i 's|image: ${FRONT_IMAGE}:.*|image: ${FRONT_IMAGE}:${FRONT_IMAGE_TAG}|' ${K8S_APP_DIR}/frontend-deployment.yaml
                            """
                        }
                    }


                    sh """
                        git config --global --add safe.directory "${WORKSPACE}"
                        git config user.name "jenkins"
                        git config user.email "jenkins@beyond.com"
                        git status --short ${K8S_APP_DIR}
                    """
                }
            }
        }


        // 변경된 파일이 back/ 또는 front/ 디렉토리에 있는 경우에만 매니페스트 변경 사항을 커밋하고 GitHub 저장소로 푸시한다.
        // 이 커밋이 github 저장소의 main 브랜치에 푸시되면 ArgoCD가 자동으로 변경 사항을 감지하여 Kubernetes 클러스터에 배포한다.
        stage('Commit & Push Manifests') {
            when {
                expression {
                    return env.BUILD_BACK == 'true' || env.BUILD_FRONT == 'true'
                }
            }
            steps {
                container('git') {
                    withCredentials([sshUserPrivateKey(
                        credentialsId: 'github-autosource-app',
                        keyFileVariable: 'GIT_SSH_KEY'
                    )]) {
                        script {
                            def updatedTargets = []
                            if (env.BUILD_BACK == 'true') {
                                updatedTargets.add("backend:${env.BACK_IMAGE_TAG}")
                            }
                            if (env.BUILD_FRONT == 'true') {
                                updatedTargets.add("frontend:${env.FRONT_IMAGE_TAG}")
                            }
                            env.IMAGE_TAG_UPDATE_MESSAGE = updatedTargets.join(', ')
                        }

                        sh """
                            git add ${K8S_APP_DIR}/backend-deployment.yaml ${K8S_APP_DIR}/frontend-deployment.yaml
                            git commit -m "chore: 이미지 태그 ${IMAGE_TAG_UPDATE_MESSAGE} 업데이트" || exit 0
                            git remote set-url origin ${GIT_PUSH_URL}
                            GIT_SSH_COMMAND="ssh -i ${GIT_SSH_KEY} -o StrictHostKeyChecking=no" git fetch origin main
                            git rebase FETCH_HEAD
                            GIT_SSH_COMMAND="ssh -i ${GIT_SSH_KEY} -o StrictHostKeyChecking=no" git push origin HEAD:main
                        """
                    }
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
